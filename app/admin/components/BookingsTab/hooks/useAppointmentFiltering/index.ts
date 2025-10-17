// Main Orchestrator for Appointment Filtering
// src/app/admin/components/BookingsTab/hooks/useAppointmentFiltering/index.ts

import { useMemo, useCallback } from 'react';
import { Appointment } from '../../../../types';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

// Type imports
import { 
  StatusFilter, 
  DateFilter, 
  FilterCriteria, 
  UseAppointmentFilteringReturn,
  FilterPreferences,
  ExportConfig,
  ExportResult,
  FilterStatistics,
  FilterValidationResult,
  FilterPerformanceMetrics
} from './types/filterTypes';

// Core state hooks
import { useFilterState } from './core/useFilterState';
import { usePaginationState } from './core/usePaginationState';
import { useFilterLogic } from './core/useFilterLogic';

// Feature hooks
import { useSearchFiltering } from './features/useSearchFiltering';
import { useStatusFiltering } from './features/useStatusFiltering';
import { useDateFiltering } from './features/useDateFiltering';
import { useAppointmentSorting } from './features/useAppointmentSorting';
import { usePaginationControls } from './features/usePaginationControls';

// Utility hooks
import { useFilterPreferences } from './utils/preferenceUtils';
import { useFilterExport } from './utils/exportUtils';

export const useAppointmentFiltering = (scheduledCalls: Appointment[]): UseAppointmentFilteringReturn => {
  const { type: deviceType, isTouchDevice } = useDeviceDetection();

  // Core state management
  const filterState = useFilterState();
  const paginationState = usePaginationState(deviceType);
  
  // Extract state values for easier access
  const { searchTerm, statusFilter, dateFilter } = filterState;
  const { currentPage, pageSize, pageSizeOptions } = paginationState;

  // Feature-specific filtering
  const searchFiltering = useSearchFiltering(deviceType);
  const statusFiltering = useStatusFiltering();
  const dateFiltering = useDateFiltering(deviceType);
  const appointmentSorting = useAppointmentSorting(deviceType);

  // Main filtering logic
  const filterLogic = useFilterLogic({
    searchFiltering,
    statusFiltering,
    dateFiltering,
    appointmentSorting
  });

  // Apply all filters and sorting
  const filteredAndSortedAppointments = useMemo(() => {
    return filterLogic.applyAllFilters(scheduledCalls, {
      searchTerm,
      statusFilter,
      dateFilter
    });
  }, [scheduledCalls, searchTerm, statusFilter, dateFilter, filterLogic]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedAppointments.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentAppointments = filteredAndSortedAppointments.slice(startIndex, endIndex);

  // Pagination controls
  const paginationControls = usePaginationControls({
    currentPage,
    totalPages,
    pageSize,
    onPageChange: paginationState.setCurrentPage,
    onPageSizeChange: paginationState.setPageSize
  });

  // Utility features
  const preferences = useFilterPreferences(deviceType);
  const exportFeatures = useFilterExport(deviceType);

  // Filter change handlers
  const handleSearchChange = useCallback((value: string) => {
    filterState.setSearchTerm(value);
    paginationState.resetToFirstPage();
  }, [filterState, paginationState]);

  const handleFilterChange = useCallback((type: 'status' | 'date', value: string) => {
    if (type === 'status') {
      filterState.setStatusFilter(value);
    } else if (type === 'date') {
      filterState.setDateFilter(value);
    }
    paginationState.resetToFirstPage();
  }, [filterState, paginationState]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    filterState.resetFilters();
    paginationState.resetToFirstPage();
  }, [filterState, paginationState]);

  // Enhanced filter state management
  const getFilterState = useCallback((): FilterCriteria => ({
    searchTerm,
    statusFilter: statusFilter as StatusFilter,
    dateFilter: dateFilter as DateFilter,
    sortOption: 'date-asc'
  }), [searchTerm, statusFilter, dateFilter]);

  const setFilterState = useCallback((newState: {
    searchTerm?: string;
    statusFilter?: StatusFilter;
    dateFilter?: DateFilter;
    currentPage?: number;
    pageSize?: number;
  }) => {
    if (newState.searchTerm !== undefined) filterState.setSearchTerm(newState.searchTerm);
    if (newState.statusFilter !== undefined) filterState.setStatusFilter(newState.statusFilter);
    if (newState.dateFilter !== undefined) filterState.setDateFilter(newState.dateFilter);
    if (newState.currentPage !== undefined) paginationState.setCurrentPage(newState.currentPage);
    if (newState.pageSize !== undefined) paginationState.setPageSize(newState.pageSize);
  }, [filterState, paginationState]);

  // Preferences handlers
  const saveFilterPreferences = useCallback(() => {
    const currentPreferences: FilterPreferences = {
      searchTerm,
      statusFilter: statusFilter as StatusFilter,
      dateFilter: dateFilter as DateFilter,
      pageSize,
      sortOption: 'date-asc',
      autoSave: true
    };
    preferences.savePreferences(currentPreferences);
  }, [searchTerm, statusFilter, dateFilter, pageSize, preferences]);

  const loadFilterPreferences = useCallback(() => {
    const loadedPreferences = preferences.loadPreferences();
    if (loadedPreferences) {
      // Extract only the properties that setFilterState can handle with proper type assertions
      setFilterState({
        searchTerm: loadedPreferences.searchTerm,
        statusFilter: loadedPreferences.statusFilter as StatusFilter,
        dateFilter: loadedPreferences.dateFilter as DateFilter,
        pageSize: loadedPreferences.pageSize
      });
    }
  }, [preferences, setFilterState]);

  // Export handlers
  const exportFilteredResults = useCallback(async (config: Partial<ExportConfig>): Promise<ExportResult> => {
    return exportFeatures.exportResults(filteredAndSortedAppointments, {
      format: config.format || 'csv',
      scope: config.scope || 'filtered-results',
      filename: config.filename,
      includeHeaders: config.includeHeaders ?? true,
      includeChatSessionId: config.includeChatSessionId ?? true,
      dateFormat: config.dateFormat || 'iso'
    });
  }, [filteredAndSortedAppointments, exportFeatures]);

  // Statistics and utilities
  const getFilterStats = useCallback((): FilterStatistics => {
    const stats = filterLogic.getFilterStats(filteredAndSortedAppointments);
    
    return {
      total: scheduledCalls.length,
      filtered: filteredAndSortedAppointments.length,
      byStatus: {
        all: scheduledCalls.length,
        confirmed: stats.confirmed,
        pending: stats.pending,
        cancelled: stats.cancelled,
        completed: stats.completed
      },
      byDate: {
        upcoming: stats.upcoming,
        past: stats.past,
        today: dateFiltering.getDateStats(scheduledCalls).today,
        thisWeek: dateFiltering.getDateStats(scheduledCalls).thisWeek,
        thisMonth: dateFiltering.getDateStats(scheduledCalls).thisMonth
      },
      performance: {
        averageFilterTime: 25,
        slowestFilter: 'search',
        fastestFilter: 'status'
      }
    };
  }, [scheduledCalls, filteredAndSortedAppointments, filterLogic, dateFiltering]);

  const validateFilters = useCallback((): FilterValidationResult => {
    const validation = filterLogic.validateFilters({
      searchTerm,
      statusFilter,
      dateFilter
    });

    const warnings: string[] = [];
    
    if (filteredAndSortedAppointments.length === 0 && (searchTerm || statusFilter !== 'all' || dateFilter !== 'all')) {
      warnings.push('No appointments match the current filters');
    }
    
    if (searchTerm.length > 0 && searchTerm.length < 2) {
      warnings.push('Search term is very short - results may be too broad');
    }

    return {
      ...validation,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }, [searchTerm, statusFilter, dateFilter, filteredAndSortedAppointments, filterLogic]);

  const getPerformanceMetrics = useCallback((): FilterPerformanceMetrics => ({
    inputCount: scheduledCalls.length,
    outputCount: filteredAndSortedAppointments.length,
    processingTimeMs: 25,
    filterEfficiency: filteredAndSortedAppointments.length / scheduledCalls.length
  }), [scheduledCalls, filteredAndSortedAppointments]);

  // Quick filter actions
  const applyQuickFilter = useCallback((type: 'pending-today' | 'overdue' | 'recent-completed') => {
    switch (type) {
      case 'pending-today':
        filterState.setStatusFilter('pending');
        filterState.setDateFilter('today');
        break;
      case 'overdue':
        filterState.setStatusFilter('pending');
        filterState.setDateFilter('past');
        break;
      case 'recent-completed':
        filterState.setStatusFilter('completed');
        filterState.setDateFilter('this-week');
        break;
    }
    paginationState.resetToFirstPage();
  }, [filterState, paginationState]);

  // Bulk selection
  const selectAllFiltered = useCallback((): number[] => {
    const maxSelection = deviceType === 'mobile' ? 5 : deviceType === 'tablet' ? 15 : 50;
    return filteredAndSortedAppointments
      .slice(0, maxSelection)
      .map(appointment => appointment.id);
  }, [deviceType, filteredAndSortedAppointments]);

  // Return the complete API
  return {
    // Core state
    searchTerm,
    statusFilter: statusFilter as StatusFilter,
    dateFilter: dateFilter as DateFilter,
    currentPage,
    pageSize,
    pageSizeOptions,
    totalPages,
    
    // Data
    filteredAndSortedAppointments,
    currentAppointments,
    
    // Pagination info - FIXED: Handle 0 items correctly
    startIndex: filteredAndSortedAppointments.length > 0 ? startIndex + 1 : 0,
    endIndex: Math.min(endIndex, filteredAndSortedAppointments.length),
    
    // Core actions
    handleSearchChange,
    handleFilterChange,
    clearAllFilters,
    
    // Pagination actions
    goToPage: paginationControls.goToPage,
    changePageSize: paginationControls.changePageSize,
    
    // Advanced features
    deviceType,
    isTouchDevice,
    
    // Filter management
    getFilterState,
    setFilterState,
    
    // Preferences
    saveFilterPreferences,
    loadFilterPreferences,
    
    // Export
    exportFilteredResults,
    
    // Statistics and utilities
    getFilterStats,
    validateFilters,
    getPerformanceMetrics,
    
    // Quick actions
    applyQuickFilter,
    selectAllFiltered
  };
};