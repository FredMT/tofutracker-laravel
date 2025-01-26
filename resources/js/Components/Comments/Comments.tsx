import { CommentThread } from "./CommentThread";
import { CommentEditor } from "./CommentEditor";
import { useState } from "react";
import { Comment } from "./types";

export const SAMPLE_COMMENTS = [
    {
        id: "1",
        author: "flatulentbaboon",
        points: 11700,
        timeAgo: "17 hours ago",
        content: `<p>I just watched <strong>Godzilla Minus One</strong> and it was absolutely incredible! Here's why:</p>
            <ul>
                <li>The visual effects are <em>stunning</em></li>
                <li>The character development is <u>phenomenal</u></li>
                <li>The post-war setting adds real depth</li>
            </ul>
            <p>Definitely deserves all the <strong>Oscar nominations</strong> it's getting!</p>`,
        children: [
            {
                id: "2",
                author: "odaal",
                points: 2614,
                timeAgo: "16 hours ago",
                content: `<p>Couldn't agree more! The way they handled the <strong>PTSD themes</strong> was incredible. Also, did you notice how they used:</p>
                <blockquote>Sound design to create tension even when Godzilla isn't on screen</blockquote>
                <p>The attention to detail is just <em>mind-blowing</em>.</p>`,
                children: [
                    {
                        id: "3",
                        author: "randynumbergenerator",
                        points: 378,
                        timeAgo: "15 hours ago",
                        content: `<p>The sound design was fantastic! Here's a cool fact:</p>
                        <p>They actually mixed <strong>real animal sounds</strong> with:</p>
                        <ul>
                            <li>Traditional Godzilla roars</li>
                            <li>Modern sound effects</li>
                            <li>Some <em>classified</em> techniques</li>
                        </ul>`,
                        children: [
                            {
                                id: "4",
                                author: "ianandrxs",
                                points: 209,
                                timeAgo: "15 hours ago",
                                content: `<p>That's fascinating! No wonder it feels so <strong>organic</strong> and <em>terrifying</em> at the same time. The way they balanced practical effects with CGI was also perfect.</p>`,
                            },
                        ],
                    },
                    {
                        id: "5",
                        author: "deep_nested",
                        points: 156,
                        timeAgo: "14 hours ago",
                        content: `<p>The <u>practical effects</u> were amazing too! Check out this comparison:</p>
                        <ol>
                            <li>Original Godzilla (1954): Pure practical</li>
                            <li>Shin Godzilla (2016): Mostly CGI</li>
                            <li>Minus One (2023): <strong>Perfect blend</strong></li>
                        </ol>`,
                        children: [
                            {
                                id: "6",
                                author: "even_deeper",
                                points: 89,
                                timeAgo: "13 hours ago",
                                content: `<p>And don't forget about the <em>miniature work</em>! The detail in those destroyed buildings was <strong>incredible</strong>. Some shots were so good, I still can't tell if they were practical or CGI.</p>`,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: "7",
        author: "top_level",
        points: 543,
        timeAgo: "16 hours ago",
        content: `<p>The <strong>character development</strong> in this movie deserves its own discussion. The way they handled:</p>
        <ol>
            <li>Post-war trauma</li>
            <li>Personal redemption</li>
            <li>Collective responsibility</li>
        </ol>
        <p>It's rare to see such depth in a <em>kaiju film</em>!</p>`,
        children: [
            {
                id: "8",
                author: "nested_reply",
                points: 232,
                timeAgo: "15 hours ago",
                content: `<p>Absolutely! And the way they tied the <strong>personal story</strong> to the <em>larger narrative</em> was masterful. The protagonist's arc mirrors Japan's post-war recovery perfectly.</p>`,
            },
        ],
    },
];

export default function Comments() {
    const [comments, setComments] = useState<Comment[]>(SAMPLE_COMMENTS);

    const handleSave = (content: string) => {
        const newComment: Comment = {
            id: Math.random().toString(),
            author: "Current User", // TODO: Get from auth
            points: 0,
            timeAgo: "just now",
            content,
        };

        setComments([newComment, ...comments]);
    };

    const handleReply = (parentId: string, content: string) => {
        const newComment: Comment = {
            id: Math.random().toString(),
            author: "Current User", // TODO: Get from auth
            points: 0,
            timeAgo: "just now",
            content,
        };

        const addReply = (comments: Comment[]): Comment[] => {
            return comments.map((comment) => {
                if (comment.id === parentId) {
                    return {
                        ...comment,
                        children: [...(comment.children || []), newComment],
                    };
                }
                if (comment.children) {
                    return {
                        ...comment,
                        children: addReply(comment.children),
                    };
                }
                return comment;
            });
        };

        setComments(addReply(comments));
    };

    const handleEdit = (commentId: string, content: string) => {
        const editComment = (comments: Comment[]): Comment[] => {
            return comments.map((comment) => {
                if (comment.id === commentId) {
                    return {
                        ...comment,
                        content,
                        timeAgo: "edited just now", // Optional: indicate edit
                    };
                }
                if (comment.children) {
                    return {
                        ...comment,
                        children: editComment(comment.children),
                    };
                }
                return comment;
            });
        };

        setComments(editComment(comments));
    };

    return (
        <div className="space-y-6">
            <CommentEditor onSave={handleSave} />
            {comments.map((comment) => (
                <CommentThread
                    key={comment.id}
                    {...comment}
                    onReply={handleReply}
                    onEdit={handleEdit}
                />
            ))}
        </div>
    );
}
