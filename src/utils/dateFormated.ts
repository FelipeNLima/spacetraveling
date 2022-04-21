/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export default function DateFormat(date: string | Date | number) {
  return format(new Date(date), 'dd LLL yyyy', {
    locale: ptBR,
  });
}
