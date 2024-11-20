import { Database } from "@/types_db";

const mockGoals: Database['public']['Tables']['goals']['Row'][] = [
  {
    id: '1',
    title: 'Foundation Goal 1',
    description: 'This is a description for foundation goal 1.',
    type: 'fondation',
    progress: 50,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    workspace_id: 'c6fa3bbc-3e74-4662-a902-cf47a5905802', // Provided workspace ID
    config_id: 'config_1', // Mocked config ID
    connections: {}, // Mocked connections (can be an empty object or a valid JSON structure)
    end_date: null, // Assuming no end date for this mock
    start_date: null,
    level: 1, // Example level
    parent_goal_id: null, // Assuming no parent goal for this mock
    position_x: 0,
    position_y: 0
  },
  {
    id: '2',
    title: 'Foundation Goal 2',
    description: 'This is a description for foundation goal 2.',
    type: 'fondation',
    progress: 20,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    workspace_id: 'c6fa3bbc-3e74-4662-a902-cf47a5905802',
    config_id: 'config_2',
    connections: {},
    end_date: null,
    start_date: null,
    level: 1,
    parent_goal_id: null,
    position_x: 1,
    position_y: 0
  },
  {
    id: '3',
    title: 'Action Goal 1',
    description: 'This is a description for action goal 1.',
    type: 'action',
    progress: 80,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    workspace_id: 'c6fa3bbc-3e74-4662-a902-cf47a5905802',
    config_id: 'config_3',
    connections: {},
    end_date: null,
    start_date: null,
    level: 1,
    parent_goal_id: null,
    position_x: 0,
    position_y: 1
  },
  {
    id: '4',
    title: 'Strategy Goal 1',
    description: 'This is a description for strategy goal 1.',
    type: 'strategie',
    progress: 100,
    status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    workspace_id: 'c6fa3bbc-3e74-4662-a902-cf47a5905802',
    config_id: 'config_4',
    connections: {},
    end_date: null,
    start_date: null,
    level: 1,
    parent_goal_id: null,
    position_x: 1,
    position_y: 1
  },
  {
    id: '5',
    title: 'Vision Goal 1',
    description: 'This is a description for vision goal 1.',
    type: 'vision',
    progress: 0,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    workspace_id: 'c6fa3bbc-3e74-4662-a902-cf47a5905802',
    config_id: 'config_5',
    connections: {},
    end_date: null,
    start_date: null,
    level: 1,
    parent_goal_id: null,
    position_x: 0,
    position_y: 2
  }
];

export default mockGoals; 