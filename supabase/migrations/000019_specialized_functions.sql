 -- Team Collaboration Analysis
CREATE OR REPLACE FUNCTION analyze_team_collaboration(
    p_workspace_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    user_id UUID,
    collaboration_score INTEGER,
    interaction_count INTEGER,
    contribution_metrics JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH user_activities AS (
        -- Task Interactions
        SELECT 
            unnest(assignees) as user_id,
            COUNT(*) as task_count,
            COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks
        FROM tasks
        WHERE workspace_id = p_workspace_id
        AND created_at BETWEEN p_start_date AND p_end_date
        GROUP BY unnest(assignees)
        
        UNION ALL
        
        -- Comments and Updates
        SELECT 
            creator_id,
            COUNT(*) as interaction_count,
            0 as completed_count
        FROM updates
        WHERE created_at BETWEEN p_start_date AND p_end_date
        GROUP BY creator_id
    )
    SELECT 
        ua.user_id,
        (COALESCE(SUM(task_count), 0) * 2 + 
         COALESCE(SUM(completed_tasks), 0) * 3)::INTEGER as collaboration_score,
        COALESCE(SUM(task_count), 0)::INTEGER as interaction_count,
        jsonb_build_object(
            'tasks_assigned', COALESCE(SUM(task_count), 0),
            'tasks_completed', COALESCE(SUM(completed_tasks), 0),
            'completion_rate', 
            CASE 
                WHEN SUM(task_count) > 0 
                THEN (SUM(completed_tasks)::FLOAT / SUM(task_count) * 100)
                ELSE 0
            END
        ) as contribution_metrics
    FROM user_activities ua
    GROUP BY ua.user_id;
END;
$$ LANGUAGE plpgsql;

-- Milestone Risk Assessment
CREATE OR REPLACE FUNCTION assess_milestone_risk(
    p_milestone_id UUID
)
RETURNS TABLE (
    risk_level TEXT,
    risk_factors JSONB,
    recommendations JSONB[]
) AS $$
DECLARE
    v_milestone milestones%ROWTYPE;
    v_task_stats RECORD;
    v_risk_level TEXT;
    v_risk_factors JSONB;
    v_recommendations JSONB[];
BEGIN
    -- Get milestone details
    SELECT * INTO v_milestone
    FROM milestones
    WHERE id = p_milestone_id;

    -- Analyze task statistics
    SELECT 
        COUNT(*) as total_tasks,
        COUNT(*) FILTER (WHERE status = 'blocked') as blocked_tasks,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
        AVG(CASE WHEN deadline IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (deadline - NOW()))/86400.0 
            ELSE NULL END) as avg_days_to_deadline
    INTO v_task_stats
    FROM tasks
    WHERE milestone_id = p_milestone_id;

    -- Calculate risk level
    v_risk_level := CASE
        WHEN v_task_stats.blocked_tasks > 0 THEN 'high'
        WHEN v_milestone.target_date < NOW() THEN 'critical'
        WHEN v_task_stats.completed_tasks::FLOAT / NULLIF(v_task_stats.total_tasks, 0) < 0.3 
            AND v_milestone.target_date - NOW() < INTERVAL '7 days' THEN 'high'
        WHEN v_task_stats.avg_days_to_deadline < 3 THEN 'medium'
        ELSE 'low'
    END;

    -- Build risk factors
    v_risk_factors := jsonb_build_object(
        'blocked_tasks', v_task_stats.blocked_tasks,
        'completion_rate', 
            CASE WHEN v_task_stats.total_tasks > 0 
            THEN (v_task_stats.completed_tasks::FLOAT / v_task_stats.total_tasks * 100)
            ELSE 0 END,
        'days_to_deadline', 
            EXTRACT(DAY FROM (v_milestone.target_date - NOW())),
        'has_dependencies', EXISTS (
            SELECT 1 FROM dependencies 
            WHERE target_type = 'milestone' 
            AND target_id = p_milestone_id
        )
    );

    -- Generate recommendations
    v_recommendations := ARRAY[
        CASE WHEN v_task_stats.blocked_tasks > 0 THEN
            jsonb_build_object(
                'type', 'resolve_blockers',
                'priority', 'high',
                'description', 'Resolve blocked tasks immediately'
            )
        ELSE NULL END,
        CASE WHEN v_milestone.target_date - NOW() < INTERVAL '7 days' 
            AND v_task_stats.completed_tasks::FLOAT / NULLIF(v_task_stats.total_tasks, 0) < 0.5 THEN
            jsonb_build_object(
                'type', 'resource_allocation',
                'priority', 'high',
                'description', 'Consider allocating more resources'
            )
        ELSE NULL END
    ];

    RETURN QUERY
    SELECT v_risk_level, v_risk_factors, v_recommendations;
END;
$$ LANGUAGE plpgsql;

-- Automated Task Prioritization
CREATE OR REPLACE FUNCTION suggest_task_priority()
RETURNS TRIGGER AS $$
DECLARE
    v_deadline_score INTEGER := 0;
    v_dependency_score INTEGER := 0;
    v_milestone_score INTEGER := 0;
BEGIN
    -- Score based on deadline
    IF NEW.deadline IS NOT NULL THEN
        v_deadline_score := CASE
            WHEN NEW.deadline - NOW() < INTERVAL '1 day' THEN 5
            WHEN NEW.deadline - NOW() < INTERVAL '3 days' THEN 4
            WHEN NEW.deadline - NOW() < INTERVAL '7 days' THEN 3
            WHEN NEW.deadline - NOW() < INTERVAL '14 days' THEN 2
            ELSE 1
        END;
    END IF;

    -- Score based on dependencies
    SELECT COUNT(*) INTO v_dependency_score
    FROM dependencies
    WHERE target_type = 'task'
    AND target_id = NEW.id;

    -- Score based on milestone criticality
    IF NEW.milestone_id IS NOT NULL THEN
        SELECT CASE WHEN is_critical THEN 3 ELSE 1 END
        INTO v_milestone_score
        FROM milestones
        WHERE id = NEW.milestone_id;
    END IF;

    -- Calculate final priority
    NEW.priority := CASE
        WHEN (v_deadline_score + v_dependency_score + v_milestone_score) >= 8 THEN 'critical'
        WHEN (v_deadline_score + v_dependency_score + v_milestone_score) >= 6 THEN 'high'
        WHEN (v_deadline_score + v_dependency_score + v_milestone_score) >= 4 THEN 'medium'
        ELSE 'low'
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add Triggers
CREATE TRIGGER auto_prioritize_task
    BEFORE INSERT ON tasks
    FOR EACH ROW
    WHEN (NEW.priority IS NULL)
    EXECUTE FUNCTION suggest_task_priority();

-- Add Comments
COMMENT ON FUNCTION analyze_team_collaboration IS 'Analyzes team collaboration patterns and generates metrics';
COMMENT ON FUNCTION assess_milestone_risk IS 'Evaluates milestone risks and provides recommendations';
COMMENT ON FUNCTION suggest_task_priority IS 'Automatically suggests task priority based on multiple factors';