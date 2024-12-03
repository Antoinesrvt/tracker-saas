 -- Deadline Management & Early Warning System
CREATE OR REPLACE FUNCTION check_approaching_deadlines()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if deadline is within warning period
    IF NEW.deadline - INTERVAL '3 days' <= NOW() AND NEW.status NOT IN ('completed', 'blocked') THEN
        -- Create notification for assignees
        INSERT INTO notifications (
            user_id,
            type,
            title,
            content,
            resource_type,
            resource_id
        )
        SELECT 
            unnest(NEW.assignees),
            'deadline_warning',
            'Approaching Deadline: ' || NEW.title,
            'Task deadline is in ' || 
                EXTRACT(DAY FROM NEW.deadline - NOW()) || ' days',
            'task',
            NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Workload Analysis
CREATE OR REPLACE FUNCTION get_user_workload(
    p_user_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NOW(),
    p_end_date TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
)
RETURNS TABLE (
    total_tasks INTEGER,
    estimated_hours FLOAT,
    priority_distribution JSONB,
    deadline_conflicts INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH user_tasks AS (
        SELECT t.*
        FROM tasks t
        WHERE p_user_id = ANY(t.assignees)
        AND t.deadline BETWEEN p_start_date AND p_end_date
        AND t.status NOT IN ('completed', 'blocked')
    )
    SELECT 
        COUNT(*)::INTEGER,
        SUM(estimated_hours),
        jsonb_object_agg(priority, count)::JSONB,
        COUNT(*) FILTER (
            WHERE EXISTS (
                SELECT 1 FROM user_tasks t2 
                WHERE t2.id != user_tasks.id 
                AND ABS(EXTRACT(EPOCH FROM (t2.deadline - user_tasks.deadline))) < 86400
            )
        )::INTEGER
    FROM user_tasks
    GROUP BY priority;
END;
$$ LANGUAGE plpgsql;

-- Goal Health Check System
CREATE OR REPLACE FUNCTION update_goal_health_status()
RETURNS TRIGGER AS $$
DECLARE
    v_progress_rate FLOAT;
    v_time_elapsed FLOAT;
    v_blocked_tasks INTEGER;
BEGIN
    -- Calculate progress rate vs time elapsed
    SELECT 
        NEW.progress / NULLIF(
            EXTRACT(EPOCH FROM (NOW() - NEW.start_date)) /
            EXTRACT(EPOCH FROM (NEW.end_date - NEW.start_date)) * 100,
            0
        ),
        COUNT(*) FILTER (WHERE status = 'blocked')
    INTO v_progress_rate, v_blocked_tasks
    FROM tasks
    WHERE goal_id = NEW.id;

    -- Update health status based on metrics
    UPDATE goals SET
        health_status = CASE
            WHEN v_blocked_tasks > 0 THEN 'blocked'
            WHEN v_progress_rate < 0.7 THEN 'at_risk'
            ELSE 'on_track'
        END
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Dependency Chain Analysis
CREATE OR REPLACE FUNCTION analyze_dependency_chain(
    p_entity_type TEXT,
    p_entity_id UUID
)
RETURNS TABLE (
    chain_length INTEGER,
    blocking_items JSONB,
    critical_path JSONB,
    risk_score INTEGER
) AS $$
WITH RECURSIVE dependency_chain AS (
    -- Base case
    SELECT 
        d.source_type,
        d.source_id,
        d.target_type,
        d.target_id,
        1 as depth,
        ARRAY[d.source_id::text] as path
    FROM dependencies d
    WHERE d.target_type = p_entity_type 
    AND d.target_id = p_entity_id

    UNION ALL

    -- Recursive case
    SELECT 
        d.source_type,
        d.source_id,
        d.target_type,
        d.target_id,
        dc.depth + 1,
        dc.path || d.source_id::text
    FROM dependencies d
    JOIN dependency_chain dc ON d.target_id = dc.source_id
    WHERE NOT (d.source_id::text = ANY(dc.path))
)
SELECT 
    MAX(depth) as chain_length,
    jsonb_agg(DISTINCT jsonb_build_object(
        'type', source_type,
        'id', source_id,
        'status', 
        CASE source_type
            WHEN 'task' THEN (SELECT status FROM tasks WHERE id = source_id)
            WHEN 'goal' THEN (SELECT status FROM goals WHERE id = source_id)
        END
    )) as blocking_items,
    jsonb_agg(DISTINCT source_id) FILTER (
        WHERE depth = (SELECT MAX(depth) FROM dependency_chain)
    ) as critical_path,
    COUNT(*) FILTER (
        WHERE source_type = 'task' AND 
        EXISTS (SELECT 1 FROM tasks WHERE id = source_id AND status = 'blocked')
    )::INTEGER as risk_score
FROM dependency_chain;
$$ LANGUAGE sql;

-- Add Triggers
CREATE TRIGGER check_task_deadlines
    AFTER INSERT OR UPDATE OF deadline ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION check_approaching_deadlines();

CREATE TRIGGER update_goal_health
    AFTER UPDATE OF progress ON goals
    FOR EACH ROW
    EXECUTE FUNCTION update_goal_health_status();

-- Add Comments
COMMENT ON FUNCTION check_approaching_deadlines() IS 'Automatically creates notifications for approaching task deadlines';
COMMENT ON FUNCTION get_user_workload() IS 'Analyzes user workload including task distribution and potential conflicts';
COMMENT ON FUNCTION update_goal_health_status() IS 'Automatically updates goal health status based on progress and blockers';
COMMENT ON FUNCTION analyze_dependency_chain() IS 'Analyzes dependency chains to identify critical paths and risks';