-- Goal Progress Functions
CREATE OR REPLACE FUNCTION calculate_goal_progress(goal_id UUID)
RETURNS FLOAT AS $$
DECLARE
    total_tasks INT;
    completed_tasks INT;
    milestone_weight FLOAT := 0.4;
    task_weight FLOAT := 0.6;
    milestone_progress FLOAT;
    task_progress FLOAT;
BEGIN
    -- Calculate task progress
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'completed'::task_status)
    INTO total_tasks, completed_tasks
    FROM tasks
    WHERE tasks.goal_id = calculate_goal_progress.goal_id;

    task_progress := CASE 
        WHEN total_tasks > 0 THEN 
            (completed_tasks::FLOAT / total_tasks) * 100
        ELSE 0 
    END;

    -- Calculate milestone progress
    SELECT COALESCE(AVG(
        CASE 
            WHEN status = 'completed' THEN 100
            WHEN status = 'active' THEN 50
            ELSE 0
        END
    ), 0)
    INTO milestone_progress
    FROM milestones
    WHERE milestones.goal_id = calculate_goal_progress.goal_id;

    -- Return weighted average
    RETURN (milestone_progress * milestone_weight) + (task_progress * task_weight);
END;
$$ LANGUAGE plpgsql;

-- Metrics Calculation Functions
CREATE OR REPLACE FUNCTION calculate_metrics(target_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    WITH task_metrics AS (
        SELECT
            COUNT(*) as total_tasks,
            COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
            SUM(COALESCE(actual_hours, 0)) as total_hours,
            SUM(COALESCE(actual_cost, 0)) as total_cost
        FROM tasks
        WHERE goal_id = target_id
    ),
    time_metrics AS (
        SELECT
            COALESCE(SUM(CASE 
                WHEN status = 'completed' THEN COALESCE(actual_hours, estimated_hours)
                ELSE COALESCE(actual_hours, 0)
            END), 0) as time_spent,
            COALESCE(SUM(estimated_hours), 0) as estimated_total
        FROM tasks
        WHERE goal_id = target_id
    )
    SELECT jsonb_build_object(
        'completion_rate', CASE 
            WHEN tm.total_tasks > 0 
            THEN (tm.completed_tasks::FLOAT / tm.total_tasks * 100)
            ELSE 0
        END,
        'time_metrics', jsonb_build_object(
            'spent', time_metrics.time_spent,
            'estimated', time_metrics.estimated_total,
            'efficiency', CASE 
                WHEN time_metrics.estimated_total > 0 
                THEN (time_metrics.time_spent::FLOAT / time_metrics.estimated_total * 100)
                ELSE null
            END
        ),
        'cost_metrics', jsonb_build_object(
            'total_cost', tm.total_cost,
            'cost_per_task', CASE 
                WHEN tm.completed_tasks > 0 
                THEN (tm.total_cost::FLOAT / tm.completed_tasks)
                ELSE 0
            END
        )
    ) INTO result
    FROM task_metrics tm, time_metrics;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Automatic Update Triggers
CREATE OR REPLACE FUNCTION update_goal_on_task_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Update goal progress
    WITH new_progress AS (
        SELECT calculate_goal_progress(
            CASE
                WHEN TG_OP = 'DELETE' THEN OLD.goal_id
                ELSE NEW.goal_id
            END
        ) as value
    )
    UPDATE goals
    SET 
        progress = new_progress.value,
        updated_at = NOW()
    FROM new_progress
    WHERE id = CASE
        WHEN TG_OP = 'DELETE' THEN OLD.goal_id
        ELSE NEW.goal_id
    END;

    -- Update metrics
    WITH new_metrics AS (
        SELECT calculate_metrics(
            CASE
                WHEN TG_OP = 'DELETE' THEN OLD.goal_id
                ELSE NEW.goal_id
            END
        ) as value
    )
    UPDATE metrics
    SET 
        current_values = new_metrics.value,
        last_calculated = NOW()
    FROM new_metrics
    WHERE target_id = CASE
        WHEN TG_OP = 'DELETE' THEN OLD.goal_id
        ELSE NEW.goal_id
    END;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic updates
CREATE TRIGGER update_goal_metrics
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_goal_on_task_change();

-- Validation Functions
CREATE OR REPLACE FUNCTION validate_goal_dates()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if parent goal exists and dates are within parent's range
    IF NEW.parent_goal_id IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM goals
            WHERE id = NEW.parent_goal_id
            AND (
                NEW.start_date < start_date
                OR NEW.end_date > end_date
            )
        ) THEN
            RAISE EXCEPTION 'Goal dates must be within parent goal dates';
        END IF;
    END IF;

    -- Check if milestones are within goal dates
    IF TG_OP = 'UPDATE' THEN
        IF EXISTS (
            SELECT 1 FROM milestones
            WHERE goal_id = NEW.id
            AND (
                target_date < NEW.start_date
                OR target_date > NEW.end_date
            )
        ) THEN
            RAISE EXCEPTION 'Cannot update goal dates: milestones would be out of range';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create validation triggers
CREATE TRIGGER validate_goal_dates_trigger
    BEFORE INSERT OR UPDATE ON goals
    FOR EACH ROW
    EXECUTE FUNCTION validate_goal_dates(); 


CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON team_assignments
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);


-- Add trigger function for automatic team assignment on creation
CREATE OR REPLACE FUNCTION auth.handle_object_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert team assignment for creator as owner
    INSERT INTO team_assignments (
        user_id,
        assignable_type,
        assignable_id,
        role
    ) VALUES (
        auth.uid(),
        TG_ARGV[0]::text, -- First argument is the object type
        NEW.id,
        'owner'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers for each object type
CREATE TRIGGER handle_organization_creation
    AFTER INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION auth.handle_object_creation('organization');

CREATE TRIGGER handle_workspace_creation
    AFTER INSERT ON workspaces
    FOR EACH ROW
    EXECUTE FUNCTION auth.handle_object_creation('workspace');

CREATE TRIGGER handle_goal_creation
    AFTER INSERT ON goals
    FOR EACH ROW
    EXECUTE FUNCTION auth.handle_object_creation('goal');