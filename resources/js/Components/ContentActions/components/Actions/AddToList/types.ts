export type UserList = {
    id: number;
    title: string;
    has_item: boolean;
};

export type UserLists = UserList[];

export type CreateListForm = {
    title: string;
    description: string;
};

export type ListContentProps = {
    search: string;
    setSearch: (value: string) => void;
    filteredLists: UserList[];
    handleAddToList: (id: number) => void;
    handleGoToList: (id: number) => void;
    openCreate: () => void;
};

export type CreateFormProps = {
    form: CreateListForm;
    setForm: (form: CreateListForm) => void;
    closeCreate: () => void;
    handleCreateList: () => void;
};
