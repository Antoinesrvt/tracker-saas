 -- Progress Calculation Functions
CREATE OR REPLACE FUNCTION calculate_task_progress(p_task_id UUID)
RETURNS FLOAT AS $$
DECLARE
    subtask_count INTEGER;
    completed_subtasks INTEGER;
    checklist_count INTEGER;
    completed_checklist INTEGER;
BEGIN
    -- Get subtask completion
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE completed = true)
    INTO subtask_count, completed_subtasks
    FROM subtasks
    WHERE task_id = p_task_id;

    -- Get checklist completion
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE completed = true)
    INTO checklist_count, completed_checklist
    FROM checklist_items
    WHERE task_id = p_task_id;

    -- Calculate total progress
    RETURN CASE 
        WHEN (subtask_count + checklist_count) > 0 THEN
            ((COALESCE(completed_subtasks, 0) + COALESCE(completed_checklist, 0))::FLOAT / 
            (COALESCE(subtask_count, 0) + COALESCE(checklist_count, 0))) * 100
        ELSE 
            CASE 
                WHEN status = 'completed' THEN 100
                WHEN status = 'in_progress' THEN 50
                ELSE 0
            END
        END;
END;
$$ LANGUAGE plpgsql;

-- Milestone Progress Auto-calculation
CREATE OR REPLACE FUNCTION calculate_milestone_progress(p_milestone_id UUID)
RETURNS FLOAT AS $$
DECLARE
    task_progress FLOAT;
BEGIN
    SELECT AVG(calculate_task_progress(id))
    INTO task_progress
    FROM tasks
    WHERE milestone_id = p_milestone_id;
    
    RETURN COALESCE(task_progress, 0);
END;
$$ LANGUAGE plpgsql;

-- Goal Progress Auto-calculation
CREATE OR REPLACE FUNCTION calculate_goal_progress(p_goal_id UUID)
RETURNS FLOAT AS $$
DECLARE
    milestone_weight FLOAT := 0.4;
    task_weight FLOAT := 0.6;
    milestone_progress FLOAT;
    task_progress FLOAT;
BEGIN
    -- Calculate milestone progress
    SELECT AVG(progress)
    INTO milestone_progress
    FROM milestones
    WHERE goal_id = p_goal_id;

    -- Calculate task progress
    SELECT AVG(calculate_task_progress(id))
    INTO task_progress
    FROM tasks
    WHERE goal_id = p_goal_id;

    RETURN (
        COALESCE(milestone_progress, 0) * milestone_weight +
        COALESCE(task_progress, 0) * task_weight
    );
END;
$$ LANGUAGE plpgsql;

-- Automation Execution Function
CREATE OR REPLACE FUNCTION execute_automation(
    p_automation_id UUID,
    p_trigger_details JSONB
) RETURNS BOOLEAN AS $$
DECLARE
    v_automation automations%ROWTYPE;
    v_action JSONB;
    v_success BOOLEAN := true;
BEGIN
    -- Get automation details
    SELECT * INTO v_automation
    FROM automations
    WHERE id = p_automation_id;

    -- Execute each action
    FOR v_action IN SELECT * FROM jsonb_array_elements(v_automation.actions)
    LOOP
        -- Execute based on action type
        CASE v_action->>'type'
            WHEN 'update_status' THEN
                EXECUTE format(
                    'UPDATE %I SET status = $1 WHERE id = $2',
                    v_action->>'target_type'
                ) USING v_action->>'status', (v_action->>'target_id')::UUID;
                
            WHEN 'create_task' THEN
                INSERT INTO tasks (
                    title,
                    description,
                    goal_id,
                    status,
                    priority
                ) VALUES (
                    v_action->>'title',
                    v_action->>'description',
                    (v_action->>'goal_id')::UUID,
                    COALESCE(v_action->>'status', 'todo'),
                    COALESCE(v_action->>'priority', 'medium')
                );

            WHEN 'send_notification' THEN
                INSERT INTO notifications (
                    user_id,
                    type,
                    title,
                    content,
                    resource_type,
                    resource_id
                ) VALUES (
                    (v_action->>'user_id')::UUID,
                    v_action->>'notification_type',
                    v_action->>'title',
                    v_action->>'content',
                    v_action->>'resource_type',
                    (v_action->>'resource_id')::UUID
                );
        END CASE;
    END LOOP;

    -- Log execution
    INSERT INTO automation_logs (
        automation_id,
        status,
        trigger_details,
        execution_result
    ) VALUES (
        p_automation_id,
        CASE WHEN v_success THEN 'success' ELSE 'failed' END,
        p_trigger_details,
        jsonb_build_object('success', v_success)
    );

    RETURN v_success;
EXCEPTION WHEN OTHERS THEN
    -- Log error
    INSERT INTO automation_logs (
        automation_id,
        status,
        trigger_details,
        execution_result
    ) VALUES (
        p_automation_id,
        'failed',
        p_trigger_details,
        jsonb_build_object(
            'error', SQLERRM,
            'detail', SQLSTATE
        )
    );
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger Functions for Automation
CREATE OR REPLACE FUNCTION handle_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Execute relevant automations
    IF NEW.status != OLD.status THEN
        PERFORM execute_automation(a.id, jsonb_build_object(
            'entity_type', TG_TABLE_NAME,
            'entity_id', NEW.id,
            'old_status', OLD.status,
            'new_status', NEW.status
        ))
        FROM automations a
        WHERE a.trigger_type = 'on_status_change'
        AND a.enabled = true
        AND (a.trigger_config->>'table_name')::text = TG_TABLE_NAME;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add Triggers
CREATE TRIGGER on_task_status_change
    AFTER UPDATE OF status ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION handle_status_change();

CREATE TRIGGER on_goal_status_change
    AFTER UPDATE OF status ON goals
    FOR EACH ROW
    EXECUTE FUNCTION handle_status_change();

CREATE TRIGGER on_milestone_status_change
    AFTER UPDATE OF status ON milestones
    FOR EACH ROW
    EXECUTE FUNCTION handle_status_change();

-- Progress Update Triggers
CREATE TRIGGER update_task_progress
    AFTER INSERT OR UPDATE OR DELETE ON subtasks
    FOR EACH ROW
    EXECUTE FUNCTION update_task_progress();

CREATE TRIGGER update_milestone_progress
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW
    WHEN (NEW.milestone_id IS NOT NULL)
    EXECUTE FUNCTION update_milestone_progress();

CREATE TRIGGER update_goal_progress
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_goal_progress();