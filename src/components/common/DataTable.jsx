import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsUpDown, ArrowDown, ArrowUp, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

// Sentinel for a filter's "All" option. Exported so a controlled parent can
// recognise it instead of hardcoding the string.
export const ALL_FILTER = '__all__'
const ALL = ALL_FILTER

// Filter options accept plain strings or { label, value } objects.
function optionValue(option) {
  return typeof option === 'string' ? option : option.value
}
function optionLabel(option) {
  return typeof option === 'string' ? option : option.label
}

// Values are stringified before matching so search works across numbers/dates too.
function matchesSearch(row, keys, query) {
  if (!query) return true
  const needle = query.toLowerCase()
  return keys.some((key) => {
    const value = typeof key === 'function' ? key(row) : row[key]
    return value != null && String(value).toLowerCase().includes(needle)
  })
}

/**
 * Shared admin table: search, dropdown filters, sorting, pagination and
 * click-through rows. Pages supply `columns` + `rows` and stay declarative.
 *
 * columns: [{ key, header, cell?, sortValue?, className?, headClassName?,
 *             sortable?, stopClick? }]
 * filters: [{ key, label, options, match? }]
 */
export function DataTable({
  columns,
  rows,
  getRowId = (row) => row.id,
  onRowClick,
  searchKeys = [],
  searchPlaceholder = 'Search…',
  filters = [],
  pageSize = 5,
  title,
  description,
  toolbarExtra,
  emptyMessage = 'Nothing to show yet.',
  noResultsMessage = 'No matches. Try a different search or filter.',
  // Optional controlled filters. Omit both and the table keeps its own state —
  // pass them when something outside the table (a URL, a banner button) has to
  // drive the same filter, so there's only ever one source of truth.
  filterValues: controlledFilters,
  onFilterValuesChange,
}) {
  const [query, setQuery] = useState('')
  const [internalFilters, setInternalFilters] = useState({})
  const [sort, setSort] = useState(null) // { key, dir: 'asc' | 'desc' }
  const [page, setPage] = useState(1)

  const isControlled = controlledFilters !== undefined
  const filterValues = isControlled ? controlledFilters : internalFilters

  const commitFilters = (next) => {
    if (isControlled) onFilterValuesChange?.(next)
    else setInternalFilters(next)
  }

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (!matchesSearch(row, searchKeys, query)) return false
      return filters.every((filter) => {
        const active = filterValues[filter.key]
        if (!active || active === ALL) return true
        if (filter.match) return filter.match(row, active)
        return String(row[filter.key]) === active
      })
    })
  }, [rows, query, filterValues, filters, searchKeys])

  const sorted = useMemo(() => {
    if (!sort) return filtered
    const column = columns.find((c) => c.key === sort.key)
    if (!column) return filtered
    const read = column.sortValue ?? ((row) => row[column.key])
    return [...filtered].sort((a, b) => {
      const av = read(a)
      const bv = read(b)
      if (av == null) return 1
      if (bv == null) return -1
      const result =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv))
      return sort.dir === 'asc' ? result : -result
    })
  }, [filtered, sort, columns])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  // A narrowed result set can otherwise strand you on a page that no longer exists.
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const pageRows = sorted.slice(start, start + pageSize)

  // Narrowing the results should always drop you back to the first page.
  const updateQuery = (value) => {
    setQuery(value)
    setPage(1)
  }

  const updateFilter = (key, value) => {
    commitFilters({ ...filterValues, [key]: value })
    setPage(1)
  }

  const activeFilterCount = filters.filter(
    (f) => filterValues[f.key] && filterValues[f.key] !== ALL
  ).length
  const hasToolbarState = query || activeFilterCount > 0

  const toggleSort = (column) => {
    if (!column.sortable) return
    setSort((prev) =>
      prev?.key === column.key
        ? { key: column.key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key: column.key, dir: 'asc' }
    )
  }

  const clearAll = () => {
    setQuery('')
    commitFilters({})
    setPage(1)
  }

  return (
    <Card>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          <CardDescription>
            {description ??
              `${sorted.length} of ${rows.length} ${rows.length === 1 ? 'record' : 'records'}`}
          </CardDescription>
        </CardHeader>
      )}

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {searchKeys.length > 0 && (
            <div className="relative min-w-52 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => updateQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
          )}

          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={filterValues[filter.key] ?? ALL}
              onValueChange={(value) => updateFilter(filter.key, value)}
            >
              <SelectTrigger className="w-auto min-w-36 gap-1.5">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{filter.label}: All</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={optionValue(option)} value={optionValue(option)}>
                    {optionLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {hasToolbarState && (
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={clearAll}>
              <X className="size-3.5" />
              Clear
            </Button>
          )}

          {toolbarExtra && <div className="ml-auto flex items-center gap-2">{toolbarExtra}</div>}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn(column.headClassName, column.sortable && 'p-0')}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column)}
                        className="flex w-full items-center gap-1.5 px-2 py-2 text-left font-medium transition-colors hover:text-foreground"
                      >
                        {column.header}
                        {sort?.key === column.key ? (
                          sort.dir === 'asc' ? (
                            <ArrowUp className="size-3.5 text-primary" />
                          ) : (
                            <ArrowDown className="size-3.5 text-primary" />
                          )
                        ) : (
                          <ChevronsUpDown className="size-3.5 text-muted-foreground/40" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(onRowClick && 'cursor-pointer')}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={column.className}
                      // Action buttons live inside rows — don't let them navigate.
                      onClick={column.stopClick ? (e) => e.stopPropagation() : undefined}
                    >
                      {column.cell ? column.cell(row) : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}

              {pageRows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    {rows.length === 0 ? emptyMessage : noResultsMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {sorted.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{start + 1}</span>–
              <span className="font-medium text-foreground">
                {Math.min(start + pageSize, sorted.length)}
              </span>{' '}
              of <span className="font-medium text-foreground">{sorted.length}</span>
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={safePage === 1}
                  onClick={() => setPage(safePage - 1)}
                >
                  <ChevronLeft className="size-3.5" />
                  Prev
                </Button>
                <span className="px-2 text-xs text-muted-foreground">
                  Page <span className="font-medium text-foreground">{safePage}</span> of{' '}
                  <span className="font-medium text-foreground">{totalPages}</span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={safePage === totalPages}
                  onClick={() => setPage(safePage + 1)}
                >
                  Next
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
