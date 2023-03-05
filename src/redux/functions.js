const dateGenerator = ( dateString ) => {
    const date = new Date( dateString );
    return `${ formatDateNumber(date.getDate()) }/${ formatDateNumber(date.getMonth() + 1) }/${ date.getFullYear() } lúc ${ formatDateNumber(date.getHours()) }:${ formatDateNumber(date.getMinutes()) }`
}

const formatDateNumber = (int) => {
    if( int < 10 ){
        return `0${int}`
    }else{
        return `${int}`
    }
}

const openTab = (url) => {
    window.open(url, '_blank').focus();
}


const autoLabel = ( key ) => {
    switch (key) {
        case "INITIALIZING":
            return "Khởi động";
            break;
        case "STARTED":
            return "Bắt đầu";
            break;
        case "PROGRESS":
            return "Thực hiện";
            break;
        case "RELEASE":
            return "Triển khai";
            break;
        case "FINAL":
            return "Cuối cùng";
            break;
        case "COMPLETED":
            return "Hoàn thành";
            break;
        case "BUG":
            return "Lỗi";
            break;
        case "SUSPEND":
            return "Tạm dừng";
            break;
        default:
            return "Khác";
            break;
    }
}

function titleCase(str) {
    return str.toLowerCase().split(' ').map(function(word) {
        return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
}

export default {
    dateGenerator, openTab, titleCase, autoLabel
}
