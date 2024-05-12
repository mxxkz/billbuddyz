import dayjs, { Dayjs } from 'dayjs'

interface GeneratedDate {
  currentMonth: boolean;
  date: Dayjs;
  today?: boolean;
}

export const generateDate = (
  month: number = dayjs().month(),
  year: number = dayjs().year()
): GeneratedDate[] => {
  const firstDateOfMonth: Dayjs = dayjs().year(year).month(month).startOf("month");
  const lastDateOfMonth: Dayjs = dayjs().year(year).month(month).endOf("month");

  const arrayOfDate: GeneratedDate[] = [];

  // create prefix date
  for (let i = 0; i < firstDateOfMonth.day(); i++) {
    const date: Dayjs = firstDateOfMonth.day(i);

    arrayOfDate.push({
      currentMonth: false,
      date,
    });
  }

  // generate current date
  for (let i = firstDateOfMonth.date(); i <= lastDateOfMonth.date(); i++) {
    arrayOfDate.push({
      currentMonth: true,
      date: firstDateOfMonth.date(i),
      today:
        firstDateOfMonth.date(i).toDate().toDateString() ===
        dayjs().toDate().toDateString(),
    });
  }

  const remaining: number = 42 - arrayOfDate.length;

  for (
    let i = lastDateOfMonth.date() + 1;
    i <= lastDateOfMonth.date() + remaining;
    i++
  ) {
    arrayOfDate.push({
      currentMonth: false,
      date: lastDateOfMonth.date(i),
    });
  }
  return arrayOfDate;
};

export const months: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
