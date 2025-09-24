import { useState, useEffect, useMemo } from 'react'
import type { LeadMineBusiness } from '@/lib/leadMine'

export function useSelection(businesses: LeadMineBusiness[], existingMemberSet: Set<string>) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectAllResults, setSelectAllResults] = useState(false)

  // Remove selected items that are already members
  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => !existingMemberSet.has(id)))
  }, [existingMemberSet])

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const toggleSelectAll = () => {
    if (selectAllResults) {
      setSelectedIds([])
      setSelectAllResults(false)
    } else {
      const availableIds = businesses
        .filter((b) => !existingMemberSet.has(b.id))
        .map((b) => b.id)
      setSelectedIds(availableIds)
      setSelectAllResults(true)
    }
  }

  const selectedBusinesses = useMemo(() => {
    return businesses.filter((b) => selectedIds.includes(b.id))
  }, [businesses, selectedIds])

  const isAllSelected = useMemo(() => {
    const availableBusinesses = businesses.filter((b) => !existingMemberSet.has(b.id))
    return availableBusinesses.length > 0 && selectedIds.length === availableBusinesses.length
  }, [businesses, selectedIds, existingMemberSet])

  const hasSelection = selectedIds.length > 0

  return {
    selectedIds,
    setSelectedIds,
    selectAllResults,
    setSelectAllResults,
    toggleSelection,
    toggleSelectAll,
    selectedBusinesses,
    isAllSelected,
    hasSelection,
  }
}







