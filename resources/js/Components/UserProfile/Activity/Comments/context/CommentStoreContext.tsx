import React, { createContext, useContext, ReactNode } from 'react';
import { CommentStore } from '@/Components/UserProfile/Activity/Comments/store/activityCommentsStore';

interface CommentStoreProviderProps {
	children: ReactNode;
	store: CommentStore;
}

const CommentStoreContext = createContext<CommentStore | null>(null);

export const CommentStoreProvider: React.FC<CommentStoreProviderProps> = ({
	children,
	store,
}) => {
	return (
		<CommentStoreContext.Provider value={store}>
			{children}
		</CommentStoreContext.Provider>
	);
};

export const useCommentStoreContext = (): CommentStore => {
	const context = useContext(CommentStoreContext);
	if (!context) {
		throw new Error(
			'useCommentStoreContext must be used within a CommentStoreProvider'
		);
	}
	return context;
};
