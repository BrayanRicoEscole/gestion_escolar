
import { useState, useEffect, useMemo } from 'react';
import { AcademicRecord } from '../../../types';
import { getAllAcademicRecords, getSchoolYearsList } from '../../../services/api';

export const useAcademicRecords = () => {
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState<{id: string, name: string}[]>([]);
  
  const [filters, setFilters] = useState({
    schoolYearId: '',
    academicLevel: '',
    atelier: '',
    status: '',
    search: '',
    missingDates: false,
    upcomingEnd: false,
    springSent: '',
    winterSent: '',
    autumnSent: '',
    summerSent: '',
    finalReportSent: ''
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await getAllAcademicRecords({
        schoolYearId: filters.schoolYearId || undefined,
        academicLevel: filters.academicLevel || undefined,
        atelier: filters.atelier || undefined,
        status: filters.status || undefined
      });
      setRecords(data);
    } catch (e) {
      console.error("Error fetching academic records:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSchoolYearsList().then(setYears);
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [filters.schoolYearId, filters.academicLevel, filters.atelier, filters.status]);

  const filteredRecords = useMemo(() => {
    let result = records;

    // Filter by search
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(r => 
        r.student_name?.toLowerCase().includes(s) || 
        r.student_document?.toLowerCase().includes(s) ||
        r.school_year_name?.toLowerCase().includes(s)
      );
    }

    // Filter by missing dates
    if (filters.missingDates) {
      result = result.filter(r => 
        !r.start_date || r.start_date === 'N/A' || 
        !r.end_date || r.end_date === 'N/A'
      );
    }

    // Filter by upcoming end date (within 30 days)
    if (filters.upcomingEnd) {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      result = result.filter(r => {
        if (!r.end_date || r.end_date === 'N/A') return false;
        try {
          const endDate = new Date(r.end_date);
          return endDate >= today && endDate <= thirtyDaysFromNow;
        } catch {
          return false;
        }
      });
    }

    // Filter by report statuses
    if (filters.springSent !== '') {
      const val = filters.springSent === 'true';
      result = result.filter(r => !!r.spring_sent === val);
    }
    if (filters.winterSent !== '') {
      const val = filters.winterSent === 'true';
      result = result.filter(r => !!r.winter_sent === val);
    }
    if (filters.autumnSent !== '') {
      const val = filters.autumnSent === 'true';
      result = result.filter(r => !!r.autumn_sent === val);
    }
    if (filters.summerSent !== '') {
      const val = filters.summerSent === 'true';
      result = result.filter(r => !!r.summer_sent === val);
    }
    if (filters.finalReportSent !== '') {
      const val = filters.finalReportSent === 'true';
      result = result.filter(r => !!r.final_report_sent === val);
    }

    return result;
  }, [records, filters]);

  return {
    records: filteredRecords,
    loading,
    years,
    filters,
    setFilters,
    refetch: fetchRecords
  };
};
