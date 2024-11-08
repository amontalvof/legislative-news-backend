import { createHash } from 'crypto';
import { statesList } from '../constants/data';

const checkState = (state: string, text?: string) => {
    return text?.toLowerCase().includes(state.toLowerCase());
};

export const findStatesInArticle = (
    title: string,
    description: string,
    content: string
) => {
    return statesList.find(
        (state) =>
            checkState(state, title) ||
            checkState(state, description) ||
            checkState(state, content)
    );
};

export const generateUniqueId = ({
    title,
    author,
    dateTime,
}: {
    title: string;
    author: string;
    dateTime: string;
}) => {
    const data = `${title}-${author}-${dateTime}`;
    return createHash('sha256').update(data).digest('hex');
};
