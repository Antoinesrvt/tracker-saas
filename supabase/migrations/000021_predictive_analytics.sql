 -- Task Completion Time Prediction
CREATE OR REPLACE FUNCTION predict_task_completion_time(
    p_task_id UUID,
    p_confidence_level FLOAT DEFAULT 0.8
)
RETURNS TABLE (
    estimated_days FLOAT,
    confidence_range JSONB,
    factors JSONB
) AS $$
DECLARE
    v_task tasks%ROWTYPE;
    v_historical_avg FLOAT;
    v_complexity_factor FLOAT := 1.0;
    v_team_velocity FLOAT;
    v_dependency_impact FLOAT := 0;
BEGIN
    -- Get task details
    SELECT * INTO v_task
    FROM tasks
    WHERE id = p_task_id;

    -- Calculate historical average for similar tasks
    SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400.0)
    INTO v_historical_avg
    FROM tasks
    WHERE 
        goal_id = v_task.goal_id
        AND status = 'completed'
        AND priority = v_task.priority;

    -- Calculate team velocity
    SELECT 
        COUNT(*) FILTER (WHERE status = 'completed')::FLOAT / 
        GREATEST(COUNT(*), 1) * 100
    INTO v_team_velocity
    FROM tasks
    WHERE assignees && v_task.assignees
    AND updated_at > NOW() - INTERVAL '30 days';

    -- Analyze dependencies impact
    WITH RECURSIVE dep_chain AS (
        SELECT source_id, target_id, 1 as depth
        FROM dependencies
        WHERE target_type = 'task' AND target_id = p_task_id
        
        UNION ALL
        
        SELECT d.source_id, d.target_id, dc.depth + 1
        FROM dependencies d
        JOIN dep_chain dc ON d.target_id = dc.source_id
        WHERE d.target_type = 'task'
        AND depth < 5
    )
    SELECT COUNT(*)::FLOAT * 0.2
    INTO v_dependency_impact
    FROM dep_chain;

    -- Calculate complexity factor
    v_complexity_factor := CASE
        WHEN v_task.estimated_hours > 40 THEN 1.5
        WHEN v_task.estimated_hours > 20 THEN 1.2
        ELSE 1.0
    END;

    RETURN QUERY
    SELECT 
        COALESCE(v_historical_avg * v_complexity_factor * (1 + v_dependency_impact), 
                 v_task.estimated_hours / 8 * v_complexity_factor) as estimated_days,
        jsonb_build_object(
            'min', COALESCE(v_historical_avg * 0.8, v_task.estimated_hours / 8 * 0.8),
            'max', COALESCE(v_historical_avg * 1.2, v_task.estimated_hours / 8 * 1.2)
        ) as confidence_range,
        jsonb_build_object(
            'historical_avg', v_historical_avg,
            'complexity_factor', v_complexity_factor,
            'team_velocity', v_team_velocity,
            'dependency_impact', v_dependency_impact
        ) as factors;
END;
$$ LANGUAGE plpgsql;

-- Project Timeline Analysis
CREATE OR REPLACE FUNCTION analyze_project_timeline(
    p_workspace_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    timeline_metrics JSONB,
    risk_factors JSONB,
    optimization_suggestions JSONB[]
) AS $$
DECLARE
    v_total_goals INTEGER;
    v_delayed_goals INTEGER;
    v_at_risk_goals INTEGER;
    v_resource_utilization FLOAT;
    v_critical_path_length INTEGER;
BEGIN
    -- Get date range
    p_start_date := COALESCE(p_start_date, NOW());
    p_end_date := COALESCE(p_end_date, NOW() + INTERVAL '6 months');

    -- Analyze goals
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE end_date < NOW() AND status != 'completed'),
        COUNT(*) FILTER (WHERE health_status = 'at_risk')
    INTO v_total_goals, v_delayed_goals, v_at_risk_goals
    FROM goals
    WHERE workspace_id = p_workspace_id
    AND start_date BETWEEN p_start_date AND p_end_date;

    -- Calculate resource utilization
    WITH user_assignments AS (
        SELECT 
            unnest(assignees) as user_id,
            COUNT(*) as task_count,
            SUM(estimated_hours) as total_hours
        FROM tasks t
        JOIN goals g ON t.goal_id = g.id
        WHERE g.workspace_id = p_workspace_id
        AND t.status IN ('todo', 'in_progress')
        GROUP BY unnest(assignees)
    )
    SELECT AVG(LEAST(total_hours / 160.0, 1.0)) * 100
    INTO v_resource_utilization
    FROM user_assignments;

    -- Find critical path length
    WITH RECURSIVE dependency_path AS (
        SELECT 
            id,
            estimated_hours,
            1 as path_length
        FROM tasks t
        JOIN goals g ON t.goal_id = g.id
        WHERE g.workspace_id = p_workspace_id
        AND NOT EXISTS (
            SELECT 1 FROM dependencies d
            WHERE d.target_type = 'task'
            AND d.target_id = t.id
        )

        UNION ALL

        SELECT 
            t.id,
            t.estimated_hours,
            dp.path_length + 1
        FROM tasks t
        JOIN goals g ON t.goal_id = g.id
        JOIN dependencies d ON d.target_type = 'task' AND d.target_id = t.id
        JOIN dependency_path dp ON dp.id = d.source_id
        WHERE g.workspace_id = p_workspace_id
    )
    SELECT MAX(path_length)
    INTO v_critical_path_length
    FROM dependency_path;

    RETURN QUERY
    SELECT 
        jsonb_build_object(
            'total_goals', v_total_goals,
            'delayed_goals', v_delayed_goals,
            'at_risk_goals', v_at_risk_goals,
            'resource_utilization', v_resource_utilization,
            'critical_path_length', v_critical_path_length
        ),
        jsonb_build_object(
            'timeline_risk', CASE 
                WHEN v_delayed_goals > v_total_goals * 0.2 THEN 'high'
                WHEN v_delayed_goals > v_total_goals * 0.1 THEN 'medium'
                ELSE 'low'
            END,
            'resource_risk', CASE 
                WHEN v_resource_utilization > 90 THEN 'high'
                WHEN v_resource_utilization > 75 THEN 'medium'
                ELSE 'low'
            END,
            'complexity_risk', CASE 
                WHEN v_critical_path_length > 10 THEN 'high'
                WHEN v_critical_path_length > 5 THEN 'medium'
                ELSE 'low'
            END
        ),
        ARRAY[
            CASE WHEN v_delayed_goals > 0 THEN
                jsonb_build_object(
                    'type', 'timeline_optimization',
                    'suggestion', 'Review and adjust delayed goals',
                    'impact', 'high'
                )
            END,
            CASE WHEN v_resource_utilization > 90 THEN
                jsonb_build_object(
                    'type', 'resource_optimization',
                    'suggestion', 'Consider resource reallocation or timeline adjustment',
                    'impact', 'high'
                )
            END,
            CASE WHEN v_critical_path_length > 10 THEN
                jsonb_build_object(
                    'type', 'dependency_optimization',
                    'suggestion', 'Review and optimize dependency chain',
                    'impact', 'medium'
                )
            END
        ]::jsonb[];
END;
$$ LANGUAGE plpgsql;

-- Add Comments
COMMENT ON FUNCTION predict_task_completion_time IS 'Predicts task completion time based on historical data and various factors';
COMMENT ON FUNCTION analyze_project_timeline IS 'Analyzes project timeline and provides risk assessment and optimization suggestions';