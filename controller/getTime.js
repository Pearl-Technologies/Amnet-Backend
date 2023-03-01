export const getTime = (span) => {
    switch (span) {
        case "day":
            return new Date().getFullYear() + "-" + new Date().getMonth() + 1 + "-" + (new Date().getDate() - 1);
            break;
        case "week":
            return new Date().getFullYear() + "-" + new Date().getMonth() + 1 + "-" + (new Date().getDate() - 7);
            break;
        case "month":
            if (new Date().getMonth() == 0) {
                return new Date().getFullYear() - 1 + "-" + 12 + "-" + 1;
            }
            return new Date().getFullYear() + "-" + new Date().getMonth() + "-" + 1;
            break;
        case "year":
            return new Date().getFullYear()-1+"";        
            break;
        default:
            return new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();

    }
}