import { useMemo } from 'react';
import type { Database } from '@/types/supabase';

type Goal = Database['public']['Tables']['goals']['Row'];
type GoalConnection = Database['public']['Tables']['goal_connections']['Row'];
type GoalType = Database['public']['Enums']['goal_type'];
type ConnectionStatus = Database['public']['Enums']['connection_status'];
type ConnectionStrength = Database['public']['Enums']['connection_strength'];

export interface Position {
  x: number;
  y: number;
}

interface GoalWithPosition extends Goal {
  position: Position;
  connections: GoalConnection[];
}

interface SectionLabel {
  type: GoalType;
  position: Position;
}

interface CalculatedConnection extends GoalConnection {
  source: Position;
  target: Position;
  sourceType: GoalType;
  targetType: GoalType;
}

const CARD_WIDTH = 264;
const CARD_HEIGHT = 120;
const HORIZONTAL_GAP = 120;
const VERTICAL_GAP = 80;

export function useGoalCalculations(goals: (Goal & { connections: GoalConnection[] })[]) {
  return useMemo(() => {
    const types: GoalType[] = ['fondation', 'action', 'strategie', 'vision'];
    let maxRowCount = 0;
    
    // Group goals by type
    const typeGroups = goals.reduce((acc, goal) => {
      if (!acc[goal.type]) acc[goal.type] = [];
      acc[goal.type].push(goal);
      maxRowCount = Math.max(maxRowCount, acc[goal.type].length);
      return acc;
    }, {} as Record<GoalType, typeof goals[0][]>);

    // Calculate positions
    const goalsWithPositions: GoalWithPosition[] = goals.map(goal => {
      const typeIndex = types.indexOf(goal.type);
      const goalsInType = typeGroups[goal.type] || [];
      const rowIndex = goalsInType.indexOf(goal);

      return {
        ...goal,
        position: {
          x: typeIndex * (CARD_WIDTH + HORIZONTAL_GAP),
          y: rowIndex * (CARD_HEIGHT + VERTICAL_GAP)
        }
      };
    });

    // Calculate connections with positions
    const connections: CalculatedConnection[] = goalsWithPositions
      .flatMap(sourceGoal => 
        (sourceGoal.connections || []).map(conn => {
          const targetGoal = goalsWithPositions.find(g => g.id === conn.target_goal_id);
          if (!targetGoal) return null;

          return {
            ...conn,
            source: sourceGoal.position,
            target: targetGoal.position,
            sourceType: sourceGoal.type,
            targetType: targetGoal.type
          };
        })
      )
      .filter((conn): conn is CalculatedConnection => conn !== null);

    // Calculate section labels
    const sectionLabels: SectionLabel[] = types.map((type, index) => ({
      type,
      position: {
        x: index * (CARD_WIDTH + HORIZONTAL_GAP),
        y: -VERTICAL_GAP
      }
    }));

    return {
      goalsWithPositions,
      sectionLabels,
      connections,
      dimensions: {
        width: (types.length - 1) * (CARD_WIDTH + HORIZONTAL_GAP),
        height: (maxRowCount - 1) * (CARD_HEIGHT + VERTICAL_GAP)
      }
    };
  }, [goals]);
} 