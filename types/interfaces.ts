export interface Comment {
    _id: string;
    address: string;
    comment: string;
    imageUrl?: string;
    timestamp?: Date;
    likes?: string[];
    likeCount?: number;
    username?: string;
    profileImage?: string;
}

export interface Post {
    _id: string;
    username: string;
    note: string;
    image?: string;
    video?: string;
    mediaType?: 'image' | 'video';
    tier: string;
    createdAt: string;
    comments: Comment[];
    likes: string[];
    likeCount: number;
    profileImage?: string;
}

export interface Profile {
    username: string;
    profileImage: string;
    address: string;
}
