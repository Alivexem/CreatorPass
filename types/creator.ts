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
}

export interface Profile {
    username: string;
    profileImage: string;
    address: string;
}

export interface Pass {
    _id: string;
    creatorAddress: string;
    creatorName: string;
    type: 'Regular' | 'Special' | 'VIP';
    price: number;
    message: string;
    rules: {
        funForumAccess: boolean;
        likeCommentAccess: boolean;
        downloadAccess: boolean;
        giftAccess: boolean;
    };
    image: string;
    holders: string[];
}

export interface FunChat {
    address: string;
    message: string;
    profileImage: string;
    timestamp: string;
    username?: string;
}
