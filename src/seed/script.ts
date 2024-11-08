const axios = require('axios');
const uniqBy = require('lodash/uniqBy');

import { categoryList } from '../constants/data';
import { getFormattedDate } from '../utils/date';
import { findStatesInArticle, generateUniqueId } from '../utils/general';

const API_KEY = process.env.NEWS_API_KEY;

export async function fetchLegislationNews({
    from,
    to,
    pageSize,
}: {
    from: string;
    to: string;
    pageSize: number;
}) {
    const today = new Date();
    const todayFormatted = getFormattedDate(today);
    try {
        const finalArticles = [];
        for (const element of categoryList) {
            const response = await axios.get(
                'https://newsapi.org/v2/top-headlines',
                {
                    params: {
                        country: 'us',
                        language: 'en',
                        category: element,
                        from: from ?? todayFormatted,
                        to: to ?? todayFormatted,
                        pageSize: pageSize ?? 1,
                        sortBy: 'publishedAt',
                        apiKey: API_KEY,
                    },
                }
            );
            const articles = response.data.articles;
            const mappedArticles = articles.map(
                (article: {
                    source: { id: string; name: string };
                    author: string;
                    url: string;
                    urlToImage: string;
                    title: string;
                    description: string;
                    publishedAt: string;
                    content: string;
                }) => {
                    const {
                        author,
                        title,
                        description,
                        url,
                        urlToImage,
                        content,
                        source,
                        publishedAt,
                    } = article;
                    const state =
                        findStatesInArticle(title, description, content) ??
                        null;
                    return {
                        author,
                        title,
                        description,
                        url,
                        urlToImage,
                        content,
                        state,
                        sourceName: source.name,
                        publishedAt: new Date(publishedAt),
                        category: element,
                        articleId: generateUniqueId({
                            title: article.title,
                            author: article.author,
                            dateTime: article.publishedAt,
                        }),
                    };
                }
            );
            finalArticles.push(...mappedArticles);
        }
        return uniqBy(finalArticles, 'articleId').map(
            (item: {
                author: string;
                title: string;
                description: string;
                url: string;
                urlToImage: string;
                content: string;
                state: string;
                sourceName: string;
                publishedAt: Date;
                category: string;
                articleId: string;
            }) => {
                const {
                    author,
                    title,
                    description,
                    url,
                    urlToImage,
                    content,
                    state,
                    sourceName,
                    publishedAt,
                    category,
                    articleId,
                } = item;
                return [
                    author,
                    title,
                    description,
                    url,
                    urlToImage,
                    content,
                    state,
                    sourceName,
                    publishedAt,
                    category,
                    articleId,
                ];
            }
        );
    } catch (error) {
        console.error('Error fetching news articles:', error);
    }
}
