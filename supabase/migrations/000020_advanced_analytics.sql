 -- Resource Utilization Analysis
CREATE OR REPLACE FUNCTION analyze_resource_utilization(
    p_workspace_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days'
)
RETURNS TABLE (
    resource_type TEXT,
    usage_metrics JSONB,
    access_patterns JSONB,
    optimization_suggestions JSONB[]
) AS $$
BEGIN
    RETURN QUERY
    WITH resource_stats AS (
        SELECT 
            r.type,
            COUNT(*) as total_count,
            COUNT(*) FILTER (WHERE r.created_at > p_start_date) as new_count,
            COUNT(DISTINCT r.creator_id) as unique_creators,
            jsonb_object_agg(
                r.mime_type, 
                COUNT(*)
            ) as type_distribution
        FROM resources r
        WHERE r.organization_id = (
            SELECT organization_id 
            FROM workspaces 
            WHERE id = p_workspace_id
        )
        GROUP BY r.type
    )
    SELECT 
        rs.type,
        jsonb_build_object(
            'total_count', rs.total_count,
            'new_resources', rs.new_count,
            'unique_creators', rs.unique_creators,
            'type_distribution', rs.type_distribution
        ) as usage_metrics,
        jsonb_build_object(
            'most_accessed', (
                SELECT jsonb_agg(r.id)
                FROM resources r
                WHERE r.type = rs.type
                AND r.workspace_id = p_workspace_id
                LIMIT 5
            )
        ) as access_patterns,
        ARRAY[
            CASE 
                WHEN rs.new_count = 0 THEN 
                    jsonb_build_object(
                        'type', 'underutilization',
                        'suggestion', 'Consider promoting resource type usage'
                    )
                WHEN rs.new_count > rs.total_count * 0.5 THEN
                    jsonb_build_object(
                        'type', 'rapid_growth',
                        'suggestion', 'Consider implementing better organization'
                    )
            END
        ]::jsonb[] as optimization_suggestions
    FROM resource_stats rs;
END;
$$ LANGUAGE plpgsql;

-- Workspace Health Score
CREATE OR REPLACE FUNCTION calculate_workspace_health(
    p_workspace_id UUID
)
RETURNS TABLE (
    health_score INTEGER,
    metrics JSONB,
    issues JSONB[],
    recommendations JSONB[]
) AS $$
DECLARE
    v_total_goals INTEGER;
    v_active_goals INTEGER;
    v_blocked_tasks INTEGER;
    v_overdue_tasks INTEGER;
    v_team_activity INTEGER;
BEGIN
    -- Get goal statistics
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'active')
    INTO v_total_goals, v_active_goals
    FROM goals
    WHERE workspace_id = p_workspace_id;

    -- Get task statistics
    SELECT 
        COUNT(*) FILTER (WHERE status = 'blocked'),
        COUNT(*) FILTER (WHERE deadline < NOW() AND status NOT IN ('completed', 'canceled'))
    INTO v_blocked_tasks, v_overdue_tasks
    FROM tasks
    WHERE goal_id IN (SELECT id FROM goals WHERE workspace_id = p_workspace_id);

    -- Get team activity
    SELECT COUNT(*)
    INTO v_team_activity
    FROM activity_feed
    WHERE workspace_id = p_workspace_id
    AND created_at > NOW() - INTERVAL '7 days';

    RETURN QUERY
    SELECT 
        -- Calculate health score (0-100)
        GREATEST(0, LEAST(100, (
            CASE WHEN v_total_goals > 0 
                THEN (v_active_goals::FLOAT / v_total_goals * 40) 
                ELSE 0 
            END +
            CASE WHEN v_blocked_tasks = 0 THEN 30 ELSE 0 END +
            CASE WHEN v_overdue_tasks = 0 THEN 20 ELSE 0 END +
            CASE WHEN v_team_activity > 10 THEN 10 ELSE v_team_activity END
        )::INTEGER)),
        -- Detailed metrics
        jsonb_build_object(
            'goals', jsonb_build_object(
                'total', v_total_goals,
                'active', v_active_goals,
                'completion_rate', 
                CASE WHEN v_total_goals > 0 
                    THEN (v_active_goals::FLOAT / v_total_goals * 100)
                    ELSE 0 
                END
            ),
            'tasks', jsonb_build_object(
                'blocked', v_blocked_tasks,
                'overdue', v_overdue_tasks
            ),
            'activity', jsonb_build_object(
                'weekly_actions', v_team_activity
            )
        ),
        -- Issues
        ARRAY[
            CASE WHEN v_blocked_tasks > 0 THEN
                jsonb_build_object(
                    'type', 'blocked_tasks',
                    'severity', 'high',
                    'count', v_blocked_tasks
                )
            END,
            CASE WHEN v_overdue_tasks > 0 THEN
                jsonb_build_object(
                    'type', 'overdue_tasks',
                    'severity', 'medium',
                    'count', v_overdue_tasks
                )
            END
        ]::jsonb[],
        -- Recommendations
        ARRAY[
            CASE WHEN v_blocked_tasks > 0 THEN
                jsonb_build_object(
                    'type', 'task_management',
                    'action', 'Review and unblock tasks',
                    'priority', 'high'
                )
            END,
            CASE WHEN v_team_activity < 10 THEN
                jsonb_build_object(
                    'type', 'engagement',
                    'action', 'Increase team engagement',
                    'priority', 'medium'
                )
            END
        ]::jsonb[]
    ;
END;
$$ LANGUAGE plpgsql;

-- Add Comments
COMMENT ON FUNCTION analyze_resource_utilization IS 'Analyzes resource usage patterns and provides optimization suggestions';
COMMENT ON FUNCTION calculate_workspace_health IS 'Calculates workspace health score and provides detailed metrics and recommendations';