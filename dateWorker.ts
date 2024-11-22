function getCountMonthInRange(dateStart:Date,dateEnd:Date,showLabelMonth:Boolean){
    let count=0;
    if (dateStart!=null && dateEnd!=null){
        const start = new Date(dateStart);
        const end = new Date(dateEnd);
        count=(end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())+1;
    }
    if (!showLabelMonth) return count;
    
    let n = Math.abs(count);
    n %= 100;
    if (n >= 5 && n <= 20) {
      return count+" месяцев";
    }
    n %= 10;
    if (n === 1) {
        return count+" месяц";
    }
    if (n >= 2 && n <= 4) {
        return count+" месяца";
    }
    return count+" месяцев";
}

function isDateInRange(date:Date, datestart:Date, dateend:Date) {
    const currentDate = new Date(date).setHours(0, 0, 0, 0);
    const startDate = new Date(datestart).setHours(0, 0, 0, 0);
    const endDate = (new Date(dateend)).setHours(0, 0, 0, 0); 
    return currentDate >= startDate && currentDate <= endDate;
}

function getFirstAndLastDayInWeekMonth(date=new Date()){
    const now = date;
    const dayOfWeek = now.getDay(); 
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek; 

    const firstDay = new Date(now);
    firstDay.setDate(now.getDate() + diffToMonday);
    const lastDay = new Date(firstDay);
    lastDay.setDate(firstDay.getDate() + 6);  

    return [firstDay, lastDay];

}

function getArrayMonthBetweenTwoDate(dateStart:Date,dateEnd:Date){
    let arrayDate: {start: Date, end: Date}[] = [];
    let interval={start: new Date(dateStart), end: new Date(dateEnd)};

    while (interval.start <= interval.end) {
        const intervalStart:Date = new Date(interval.start);
        const intervalEnd:Date = new Date(interval.start);
        intervalEnd.setMonth(intervalEnd.getMonth() + 1);
        intervalEnd.setDate(intervalEnd.getDate() - 1);

        arrayDate.push({ start: intervalStart, end: intervalEnd });

        interval.start.setMonth(interval.start.getMonth() + 1);
    }
    return arrayDate;
}

function formatDate(date:Date,pattern:string){
    return pattern
        .replace(/dd/g, (date.getDate() < 10 ? "0" : "") + date.getDate().toString())
        .replace(/mm/g, (date.getMonth()+1 < 10 ? "0" : "") + (date.getMonth()+1).toString())
        .replace(/yyyy/g, (date.getFullYear() < 10 ? "0" : "") + date.getFullYear().toString())
        .replace(/yy/g, (date.getFullYear()-100).toString())
        .replace(/hh/g, (date.getHours() < 10 ? "0" : "") + date.getHours().toString())
        .replace(/mi/g, (date.getMinutes() < 10 ? "0" : "") + date.getMinutes().toString())
        .replace(/ss/g, (date.getSeconds() < 10 ? "0" : "") + date.getSeconds().toString());
};

export {getCountMonthInRange, getFirstAndLastDayInWeekMonth, isDateInRange, getArrayMonthBetweenTwoDate, formatDate}