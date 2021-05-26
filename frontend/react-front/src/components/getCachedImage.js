const getCachedImage = (url, producerLogos, producerDomainMap) => {
    if (!url || url.indexOf("://") !== -1) {
        return url
    }
    const base = url.split("://")[1].split("/");
    const domain = base[0];
    const file = base[base.length - 1]
    if (producerDomainMap[file] && producerDomainMap[file][0] === domain) {
        console.log("Cached logo found: " + domain + "/" + file + " - index " + producerDomainMap[file][1])
        return producerLogos[producerDomainMap[file][1]].default
    }
    return url
};

export default getCachedImage