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
    tier: 'Free' | 'Regular' | 'Special' | 'VIP';
    createdAt: string;
    comments?: Comment[];
    likes?: string[];
    likeCount?: number;
    profileImage?: string;
}

export interface Profile {
    username: string;
    profileImage: string;
    address: string;
}
