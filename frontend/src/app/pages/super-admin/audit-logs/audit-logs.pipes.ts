import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replace',
  standalone: true
})
export class ReplacePipe implements PipeTransform {
  transform(value: string, find: string, replace: string): string {
    return value.replace(new RegExp(find, 'g'), replace);
  }
}

@Pipe({
  name: 'filterByStatus',
  standalone: true
})
export class FilterByStatusPipe implements PipeTransform {
  transform(items: any[], status: string): any[] {
    if (!items) return [];
    if (!status) return items;
    return items.filter(item => item.status === status);
  }
}
