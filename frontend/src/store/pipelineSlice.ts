import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

// Types
export interface PipelineItem {
  id: string;
  opportunity_id: string;
  title: string;
  agency: string;
  description?: string;
  contract_value?: number;
  due_date?: string;
  status: 'draft' | 'in_progress' | 'review' | 'submitted';
  stage: 'prospecting' | 'qualifying' | 'proposal' | 'negotiation' | 'won' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  pwin_score?: number;
  notes?: string;
  team_members?: string[];
  brief_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface PipelineStats {
  total_pipeline_value: number;
  total_pipeline_change: number;
  active_proposals: number;
  active_proposals_change: number;
  win_rate: number;
  win_rate_change: number;
  avg_proposal_time: number;
  avg_proposal_time_change: number;
  stage_breakdown: {
    [key: string]: {
      count: number;
      value: number;
    };
  };
}

interface PipelineState {
  items: PipelineItem[];
  activeProposals: PipelineItem[];
  stats: PipelineStats | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  filters: {
    status?: string;
    stage?: string;
    priority?: string;
  };
}

const initialState: PipelineState = {
  items: [],
  activeProposals: [],
  stats: null,
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  filters: {},
};

// Async thunks
export const addToPipeline = createAsyncThunk(
  'pipeline/addToPipeline',
  async (data: {
    opportunity_id: string;
    title: string;
    agency: string;
    description?: string;
    contract_value?: number;
    due_date?: string;
    pwin_score?: number;
  }) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch('http://localhost:8000/api/v1/pipeline/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || 'Failed to add to pipeline');
    }
    
    return response.json();
  }
);

export const fetchPipelineItems = createAsyncThunk(
  'pipeline/fetchItems',
  async ({ page = 1, limit = 10, filters = {} }: {
    page?: number;
    limit?: number;
    filters?: { status?: string; stage?: string; priority?: string };
  }) => {
    const token = localStorage.getItem('access_token');
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    
    const response = await fetch(`http://localhost:8000/api/v1/pipeline/items?${params}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch pipeline items');
    }
    
    return response.json();
  }
);

export const fetchActiveProposals = createAsyncThunk(
  'pipeline/fetchActiveProposals',
  async (limit: number = 10) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`http://localhost:8000/api/v1/pipeline/items/active?limit=${limit}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch active proposals');
    }
    
    return response.json();
  }
);

export const updatePipelineItem = createAsyncThunk(
  'pipeline/updateItem',
  async ({ id, data }: {
    id: string;
    data: Partial<PipelineItem>;
  }) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`http://localhost:8000/api/v1/pipeline/items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update pipeline item');
    }
    
    return response.json();
  }
);

export const deletePipelineItem = createAsyncThunk(
  'pipeline/deleteItem',
  async (id: string) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`http://localhost:8000/api/v1/pipeline/items/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete pipeline item');
    }
    
    return { id };
  }
);

export const sharePipelineItem = createAsyncThunk(
  'pipeline/shareItem',
  async ({ id, email }: { id: string; email: string }) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`http://localhost:8000/api/v1/pipeline/items/${id}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to share pipeline item');
    }
    
    return response.json();
  }
);

export const fetchPipelineStats = createAsyncThunk(
  'pipeline/fetchStats',
  async () => {
    const token = localStorage.getItem('access_token');
    const response = await fetch('http://localhost:8000/api/v1/pipeline/stats', {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch pipeline stats');
    }
    
    return response.json();
  }
);

// Slice
const pipelineSlice = createSlice({
  name: 'pipeline',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<{ status?: string; stage?: string; priority?: string }>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Add to pipeline
    builder
      .addCase(addToPipeline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToPipeline.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
        // Also add to active proposals if status is active
        if (['draft', 'in_progress', 'review'].includes(action.payload.status)) {
          state.activeProposals.unshift(action.payload);
        }
      })
      .addCase(addToPipeline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add to pipeline';
      });

    // Fetch pipeline items
    builder
      .addCase(fetchPipelineItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPipelineItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPipelineItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch items';
      });

    // Fetch active proposals
    builder
      .addCase(fetchActiveProposals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveProposals.fulfilled, (state, action) => {
        state.loading = false;
        state.activeProposals = action.payload;
      })
      .addCase(fetchActiveProposals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch active proposals';
      });

    // Update pipeline item
    builder
      .addCase(updatePipelineItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePipelineItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        // Update in active proposals as well
        const activeIndex = state.activeProposals.findIndex(item => item.id === action.payload.id);
        if (activeIndex !== -1) {
          state.activeProposals[activeIndex] = action.payload;
        }
      })
      .addCase(updatePipelineItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update item';
      });

    // Delete pipeline item
    builder
      .addCase(deletePipelineItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePipelineItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload.id);
        state.activeProposals = state.activeProposals.filter(item => item.id !== action.payload.id);
      })
      .addCase(deletePipelineItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete item';
      });

    // Fetch stats
    builder
      .addCase(fetchPipelineStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPipelineStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchPipelineStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch stats';
      });
  },
});

export const { setFilters, clearFilters, setCurrentPage } = pipelineSlice.actions;

// Selectors
export const selectPipelineItems = (state: RootState) => state.pipeline.items;
export const selectActiveProposals = (state: RootState) => state.pipeline.activeProposals;
export const selectPipelineStats = (state: RootState) => state.pipeline.stats;
export const selectPipelineLoading = (state: RootState) => state.pipeline.loading;
export const selectPipelineError = (state: RootState) => state.pipeline.error;
export const selectPipelineFilters = (state: RootState) => state.pipeline.filters;
export const selectCurrentPage = (state: RootState) => state.pipeline.currentPage;

export default pipelineSlice.reducer;

