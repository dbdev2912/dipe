const dateGenerator = ( dateString ) => {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const date = new Date( dateString );
    return `${ monthNames[ date.getMonth() ] } ${ date.getDate() }, ${ date.getFullYear() } at ${ date.getHours() }: ${ date.getMinutes() }`
}

const openTab = (url) => {
    window.open(url, '_blank').focus();
}

function titleCase(str) {
    return str.toLowerCase().split(' ').map(function(word) {
        return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
}

export default {
    dateGenerator, openTab, titleCase
}
