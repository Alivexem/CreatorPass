export interface Comment {
    _id: string;
    address: string;
    username: string;
    comment: string;
    timestamp?: Date;
    likes?: string[];
    likeCount?: number;
    replies?: Comment[];
    profileImage?: string;
    hasReplies?: boolean;
}

export interface Post {
    _id: string;
    username: string;
    note: string;
    image: string;
    createdAt: string;
    comments?: Comment[];
    likes?: string[];
    likeCount?: number;
}

export interface Profile {
    username: string;
    profileImage: string;
    address: string;
}
