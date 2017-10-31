
class FileLoader
{
    public static Load(filename : string, callback : Function)
    {
        let rawFile = new XMLHttpRequest();
        rawFile.open("GET", filename, false);
        rawFile.onreadystatechange = function ()
        {
            if(rawFile.readyState === 4)
            {
                if(rawFile.status === 200 || rawFile.status == 0)
                {
                    let allText = rawFile.responseText;
                    callback(allText);
                }
            }
        }
        rawFile.send(null);
    }
}