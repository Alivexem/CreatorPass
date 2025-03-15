export interface Comment {
    _id: string;
    address: string;
    comment: string;
    imageUrl?: string;  // Add this field
    timestamp?: Date;
    likes?: string[];
    likeCount?: number;
    replies?: Comment[];
    hasReplies?: boolean;
    username?: string;
    profileImage?: string;
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
