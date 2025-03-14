const URL_REGEX = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;

export const linkifyText = (text: string) => {
    return text.split(URL_REGEX).map((part, i) => {
        if (part.match(URL_REGEX)) {
            return `<a href="${part}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${part}</a>`;
        }
        return part;
    }).join('');
};
