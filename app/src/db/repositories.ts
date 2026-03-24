import { getDb } from './database';
import type { Quest, Run, ContractItem, FactionId, QuestStatus, RunStatus } from '../types';

// ─── Quest Repository ───────────────────────────────────────────────────────

function rowToQuest(row: Record<string, unknown>): Quest {
  return {
    id: row.id as string,
    title: row.title as string,
    factionId: row.faction_id as FactionId,
    status: row.status as QuestStatus,
    notes: row.notes as string,
    createdAt: row.created_at as string,
  };
}

export const questRepo = {
  async getAll(): Promise<Quest[]> {
    const db = await getDb();
    const rows = await db.select<Record<string, unknown>[]>(
      'SELECT * FROM quests ORDER BY created_at DESC'
    );
    return rows.map(rowToQuest);
  },

  async getById(id: string): Promise<Quest | null> {
    const db = await getDb();
    const rows = await db.select<Record<string, unknown>[]>(
      'SELECT * FROM quests WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? rowToQuest(rows[0]) : null;
  },

  async create(title: string, factionId: FactionId): Promise<Quest> {
    const db = await getDb();
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    await db.execute(
      'INSERT INTO quests (id, title, faction_id, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, title, factionId, 'active', '', createdAt]
    );
    return { id, title, factionId, status: 'active', notes: '', createdAt };
  },

  async update(id: string, data: Partial<Quest>): Promise<void> {
    const db = await getDb();
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
    if (data.factionId !== undefined) { fields.push('faction_id = ?'); values.push(data.factionId); }
    if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
    if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes); }

    if (fields.length === 0) return;
    values.push(id);
    await db.execute(
      `UPDATE quests SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.execute('DELETE FROM quests WHERE id = ?', [id]);
  },

  async updateStatus(id: string, status: QuestStatus): Promise<void> {
    const db = await getDb();
    await db.execute('UPDATE quests SET status = ? WHERE id = ?', [status, id]);
  },

  async updateNotes(id: string, notes: string): Promise<void> {
    const db = await getDb();
    await db.execute('UPDATE quests SET notes = ? WHERE id = ?', [notes, id]);
  },
};

// ─── Run Repository ─────────────────────────────────────────────────────────

function rowToRun(row: Record<string, unknown>): Run {
  return {
    id: row.id as string,
    questId: row.quest_id as string | null,
    startedAt: row.started_at as string,
    endedAt: row.ended_at as string | null,
    status: row.status as RunStatus,
    intentNote: row.intent_note as string,
    debriefNote: row.debrief_note as string,
    rating: row.rating as number | null,
    xpTarget: (row.xp_target as number) ?? 50,
    xpEarned: (row.xp_earned as number) ?? 0,
  };
}

export const runRepo = {
  async getAll(): Promise<Run[]> {
    const db = await getDb();
    const rows = await db.select<Record<string, unknown>[]>(
      'SELECT * FROM runs ORDER BY started_at DESC'
    );
    return rows.map(rowToRun);
  },

  async getById(id: string): Promise<Run | null> {
    const db = await getDb();
    const rows = await db.select<Record<string, unknown>[]>(
      'SELECT * FROM runs WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? rowToRun(rows[0]) : null;
  },

  async create(data: {
    id: string;
    questId: string | null;
    startedAt: string;
    intentNote: string;
    xpTarget: number;
  }): Promise<Run> {
    const db = await getDb();
    await db.execute(
      'INSERT INTO runs (id, quest_id, started_at, ended_at, status, intent_note, debrief_note, rating, xp_target, xp_earned) VALUES (?, ?, ?, NULL, ?, ?, ?, NULL, ?, 0)',
      [data.id, data.questId, data.startedAt, 'active', data.intentNote, '', data.xpTarget]
    );
    return {
      id: data.id,
      questId: data.questId,
      startedAt: data.startedAt,
      endedAt: null,
      status: 'active',
      intentNote: data.intentNote,
      debriefNote: '',
      rating: null,
      xpTarget: data.xpTarget,
      xpEarned: 0,
    };
  },

  async update(id: string, data: Partial<Run>): Promise<void> {
    const db = await getDb();
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.endedAt !== undefined) { fields.push('ended_at = ?'); values.push(data.endedAt); }
    if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
    if (data.debriefNote !== undefined) { fields.push('debrief_note = ?'); values.push(data.debriefNote); }
    if (data.rating !== undefined) { fields.push('rating = ?'); values.push(data.rating); }
    if (data.xpEarned !== undefined) { fields.push('xp_earned = ?'); values.push(data.xpEarned); }

    if (fields.length === 0) return;
    values.push(id);
    await db.execute(
      `UPDATE runs SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },

  async getWithItems(id: string): Promise<{ run: Run; items: ContractItem[] } | null> {
    const db = await getDb();
    const runRows = await db.select<Record<string, unknown>[]>(
      'SELECT * FROM runs WHERE id = ?',
      [id]
    );
    if (runRows.length === 0) return null;

    const run = rowToRun(runRows[0]);
    const itemRows = await db.select<Record<string, unknown>[]>(
      'SELECT * FROM contract_items WHERE run_id = ? ORDER BY position ASC',
      [id]
    );
    const items = itemRows.map(r => ({
      id: r.id as string,
      runId: r.run_id as string,
      text: r.text as string,
      completed: (r.completed as number) === 1,
      position: r.position as number,
      xp: (r.xp as number) ?? 50,
    }));

    return { run, items };
  },
};

// ─── Contract Repository ─────────────────────────────────────────────────────

export const contractRepo = {
  async getByRunId(runId: string): Promise<ContractItem[]> {
    const db = await getDb();
    const rows = await db.select<Record<string, unknown>[]>(
      'SELECT * FROM contract_items WHERE run_id = ? ORDER BY position ASC',
      [runId]
    );
    return rows.map(r => ({
      id: r.id as string,
      runId: r.run_id as string,
      text: r.text as string,
      completed: (r.completed as number) === 1,
      position: r.position as number,
      xp: (r.xp as number) ?? 50,
    }));
  },

  async create(item: { runId: string; text: string; position: number; xp: number }): Promise<ContractItem> {
    const db = await getDb();
    const id = crypto.randomUUID();
    await db.execute(
      'INSERT INTO contract_items (id, run_id, text, completed, position, xp) VALUES (?, ?, ?, 0, ?, ?)',
      [id, item.runId, item.text, item.position, item.xp]
    );
    return { id, runId: item.runId, text: item.text, completed: false, position: item.position, xp: item.xp };
  },

  async updateCompleted(id: string, completed: boolean): Promise<void> {
    const db = await getDb();
    await db.execute(
      'UPDATE contract_items SET completed = ? WHERE id = ?',
      [completed ? 1 : 0, id]
    );
  },

  async bulkCreate(runId: string, items: { text: string; xp: number }[]): Promise<ContractItem[]> {
    const created: ContractItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = await contractRepo.create({ runId, text: items[i].text, position: i, xp: items[i].xp });
      created.push(item);
    }
    return created;
  },
};

// ─── History Repository ───────────────────────────────────────────────────────

export interface RunStats {
  total: number;
  completed: number;
  abandoned: number;
  streak: number;
  todayTotal: number;
  todayCompleted: number;
  totalXp: number;
}

export const historyRepo = {
  async getRecentRuns(limit: number = 10): Promise<Run[]> {
    const db = await getDb();
    const rows = await db.select<Record<string, unknown>[]>(
      'SELECT * FROM runs ORDER BY started_at DESC LIMIT ?',
      [limit]
    );
    return rows.map(rowToRun);
  },

  async getDailyActivity(days: number = 14): Promise<{ date: string; xp: number; runs: number }[]> {
    const db = await getDb();
    const rows = await db.select<{ day: string; xp: number; runs: number }[]>(
      `SELECT date(started_at) as day,
              COALESCE(SUM(xp_earned), 0) as xp,
              COUNT(*) as runs
       FROM runs
       WHERE status = 'completed'
         AND date(started_at) >= date('now', '-${days - 1} days')
       GROUP BY date(started_at)
       ORDER BY day ASC`
    );

    // Fill in missing days with 0
    const result: { date: string; xp: number; runs: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = rows.find(r => r.day === dateStr);
      result.push({ date: dateStr, xp: found?.xp ?? 0, runs: found?.runs ?? 0 });
    }
    return result;
  },

  async getStats(): Promise<RunStats> {
    const db = await getDb();

    const totalRows = await db.select<{ count: number }[]>(
      'SELECT COUNT(*) as count FROM runs'
    );
    const completedRows = await db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM runs WHERE status = 'completed'"
    );
    const abandonedRows = await db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM runs WHERE status = 'abandoned'"
    );

    const today = new Date().toISOString().split('T')[0];
    const todayTotalRows = await db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM runs WHERE date(started_at) = ?",
      [today]
    );
    const todayCompletedRows = await db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM runs WHERE date(started_at) = ? AND status = 'completed'",
      [today]
    );

    // Calculate streak: consecutive days with at least one completed run
    const daysRows = await db.select<{ day: string }[]>(
      "SELECT DISTINCT date(started_at) as day FROM runs WHERE status = 'completed' ORDER BY day DESC"
    );

    let streak = 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const { day } of daysRows) {
      const dayDate = new Date(day);
      dayDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((currentDate.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }

    const totalXpRows = await db.select<{ total: number }[]>(
      "SELECT COALESCE(SUM(xp_earned), 0) as total FROM runs WHERE status = 'completed'"
    );

    return {
      total: totalRows[0]?.count ?? 0,
      completed: completedRows[0]?.count ?? 0,
      abandoned: abandonedRows[0]?.count ?? 0,
      streak,
      todayTotal: todayTotalRows[0]?.count ?? 0,
      todayCompleted: todayCompletedRows[0]?.count ?? 0,
      totalXp: totalXpRows[0]?.total ?? 0,
    };
  },
};
