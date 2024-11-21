CREATE OR REPLACE FUNCTION instantiate_saas_template(
  workspace_id UUID,
  template_name TEXT,
  project_name TEXT,
  user_id UUID
) RETURNS JSON AS $$
DECLARE
  vision_goal_id UUID;
  strategy_goals_ids UUID[];
  result JSON;
BEGIN
  -- Create Vision Goal (Top Level)
  INSERT INTO goals (
    workspace_id,
    title,
    description,
    type,
    status,
    level,
    position_x,
    position_y
  ) VALUES (
    workspace_id,
    project_name || ' - Vision',
    'Build and launch a successful SAAS product that solves real user problems',
    'vision',
    'active',
    1,
    0,
    0
  ) RETURNING id INTO vision_goal_id;

  -- Create Strategy Goals (Second Level)
  WITH strategy_goals AS (
    INSERT INTO goals (
      workspace_id,
      parent_goal_id,
      title,
      description,
      type,
      status,
      level,
      position_x,
      position_y
    ) VALUES 
    -- Product Strategy
    (workspace_id, vision_goal_id, 'Product Development', 
     'Design and develop a market-ready SAAS product',
     'strategie', 'active', 2, -200, 100),
    -- Market Strategy
    (workspace_id, vision_goal_id, 'Market Research & Validation', 
     'Validate market need and define target audience',
     'strategie', 'active', 2, 0, 100),
    -- Business Strategy
    (workspace_id, vision_goal_id, 'Business Operations', 
     'Set up business infrastructure and operations',
     'strategie', 'active', 2, 200, 100)
    RETURNING id
  )
  SELECT array_agg(id) INTO strategy_goals_ids FROM strategy_goals;

  -- Create Action Goals and their respective Milestones/Tasks
  -- Product Development Actions
  INSERT INTO goals (
    workspace_id,
    parent_goal_id,
    title,
    description,
    type,
    status,
    level
  )
  SELECT 
    workspace_id,
    strategy_goals_ids[1],
    action_title,
    action_description,
    'action',
    'active',
    3
  FROM (VALUES 
    ('Technical Architecture', 'Design and implement core technical infrastructure'),
    ('UI/UX Design', 'Create user-friendly interface and experience'),
    ('MVP Development', 'Develop minimum viable product'),
    ('Testing & QA', 'Ensure product quality and reliability')
  ) AS actions(action_title, action_description);

  -- Market Research Actions
  INSERT INTO goals (
    workspace_id,
    parent_goal_id,
    title,
    description,
    type,
    status,
    level
  )
  SELECT 
    workspace_id,
    strategy_goals_ids[2],
    action_title,
    action_description,
    'action',
    'active',
    3
  FROM (VALUES 
    ('Customer Research', 'Conduct market research and user interviews'),
    ('Competitor Analysis', 'Analyze competitive landscape'),
    ('Marketing Strategy', 'Develop marketing and launch strategy'),
    ('Sales Pipeline', 'Build sales funnel and processes')
  ) AS actions(action_title, action_description);

  -- Business Operations Actions
  INSERT INTO goals (
    workspace_id,
    parent_goal_id,
    title,
    description,
    type,
    status,
    level
  )
  SELECT 
    workspace_id,
    strategy_goals_ids[3],
    action_title,
    action_description,
    'action',
    'active',
    3
  FROM (VALUES 
    ('Legal Setup', 'Handle legal requirements and compliance'),
    ('Financial Planning', 'Develop financial model and secure funding'),
    ('Team Building', 'Recruit and onboard core team'),
    ('Operations Setup', 'Establish operational processes')
  ) AS actions(action_title, action_description);

  -- Add Foundation Goals (Support Level)
  INSERT INTO goals (
    workspace_id,
    title,
    description,
    type,
    status,
    level
  )
  SELECT 
    workspace_id,
    foundation_title,
    foundation_description,
    'fondation',
    'active',
    4
  FROM (VALUES 
    ('Infrastructure & Security', 'Establish robust technical infrastructure and security measures'),
    ('Documentation', 'Maintain comprehensive technical and process documentation'),
    ('Quality Standards', 'Define and maintain quality standards across all areas'),
    ('Knowledge Base', 'Build and maintain internal knowledge base')
  ) AS foundations(foundation_title, foundation_description);

  -- Add example milestones for Technical Architecture
  INSERT INTO milestones (
    goal_id,
    title,
    description,
    is_critical
  )
  SELECT 
    g.id,
    m.title,
    m.description,
    m.is_critical
  FROM goals g
  CROSS JOIN (VALUES 
    ('Architecture Design', 'Complete system architecture design', true),
    ('Database Schema', 'Design and implement database schema', true),
    ('API Design', 'Design RESTful API endpoints', true),
    ('Security Implementation', 'Implement security measures', true)
  ) AS m(title, description, is_critical)
  WHERE g.title = 'Technical Architecture';

  -- Add task templates
  INSERT INTO task_templates (
    workspace_id,
    title,
    description,
    priority,
    estimated_time,
    category
  )
  SELECT 
    workspace_id,
    template_title,
    template_description,
    template_priority,
    template_hours,
    template_category
  FROM (VALUES 
    ('Setup Development Environment', 'Initialize project and set up development tools', 'high', 8, 'Technical'),
    ('Create User Stories', 'Document core user stories and requirements', 'high', 16, 'Product'),
    ('Design System Setup', 'Create design system and component library', 'medium', 24, 'Design'),
    ('Market Research Survey', 'Create and conduct market research survey', 'high', 16, 'Research')
  ) AS templates(template_title, template_description, template_priority, template_hours, template_category);

  -- Return structure information
  SELECT json_build_object(
    'vision_goal_id', vision_goal_id,
    'strategy_goals', strategy_goals_ids
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql; 