
import React, { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Filter, CalendarDays, Image, FileText, Video, Music, X } from 'lucide-react';

const fileTypeOptions = [
  { value: 'all', label: 'Todos los tipos', icon: Filter },
  { value: 'image', label: 'Imágenes', icon: Image },
  { value: 'document', label: 'Documentos', icon: FileText },
  { value: 'video', label: 'Videos', icon: Video },
  { value: 'audio', label: 'Audio', icon: Music },
];

const defaultFiltersState = {
  type: 'all',
  dateRange: { start: '', end: '' },
};

const SearchFilters = ({ currentFilters = defaultFiltersState, onApplyFilters }) => {
  const [type, setType] = useState(currentFilters.type || 'all');
  const [startDate, setStartDate] = useState(currentFilters.dateRange?.start || '');
  const [endDate, setEndDate] = useState(currentFilters.dateRange?.end || '');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    const safeCurrentFilters = currentFilters || defaultFiltersState;
    setType(safeCurrentFilters.type || 'all');
    setStartDate(safeCurrentFilters.dateRange?.start || '');
    setEndDate(safeCurrentFilters.dateRange?.end || '');
  }, [currentFilters]);

  const handleApply = () => {
    onApplyFilters({
      type,
      dateRange: { 
        start: startDate || null, 
        end: endDate || null 
      },
    });
    setIsPopoverOpen(false);
  };

  const handleClearFilters = () => {
    setType('all');
    setStartDate('');
    setEndDate('');
    onApplyFilters({
      type: 'all',
      dateRange: { start: null, end: null },
    });
    setIsPopoverOpen(false);
  };
  
  const SelectedIcon = fileTypeOptions.find(opt => opt.value === type)?.icon || Filter;

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Abrir filtros de búsqueda">
          <Filter className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" align="start">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Filtros de Búsqueda</h4>
            <p className="text-sm text-muted-foreground">
              Refina tu búsqueda por tipo de archivo y fecha.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="file-type">Tipo de archivo</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <SelectedIcon className="mr-2 h-4 w-4" />
                  {fileTypeOptions.find(opt => opt.value === type)?.label || 'Seleccionar tipo'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                {fileTypeOptions.map(option => (
                  <DropdownMenuItem key={option.value} onClick={() => setType(option.value)}>
                    <option.icon className="mr-2 h-4 w-4" />
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="grid gap-2">
            <Label>Rango de Fechas</Label>
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="start-date" 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <span className="text-muted-foreground">-</span>
                <div className="relative flex-1">
                    <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="end-date" 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={handleClearFilters} size="sm">
              <X className="mr-1 h-4 w-4" /> Limpiar
            </Button>
            <Button onClick={handleApply} size="sm">Aplicar Filtros</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SearchFilters;
