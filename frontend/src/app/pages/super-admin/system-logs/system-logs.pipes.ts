import { Pipe, PipeTransform } from '@angular/core';

interface SystemLog {
  level: string;
  [key: string]: any;
}

@Pipe({
  name: 'filterByLevel',
  standalone: true
})
export class FilterByLevelPipe implements PipeTransform {
  transform(logs: SystemLog[], level: string): SystemLog[] {
    if (!level || level === 'all') {
      return logs;
    }
    return logs.filter(log => log.level === level);
  }
}

@Pipe({
  name: 'titlecase',
  standalone: true
})
export class TitleCasePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    return value
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
