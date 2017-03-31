
export const convertStringToArr = (string) =>
{
    let arr = [];
    let item = string.split(',');
    for(var i = 0; i< item.length; i++){

        arr.push({email: item[i].trim()});
    }

    return arr;

}