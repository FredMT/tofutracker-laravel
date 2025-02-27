import { Text } from "@mantine/core";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import { AnimeCollectionChain } from "../types/animeCollections";
import classes from "../AnimeCollectionTable.module.css";

interface ChainRowProps {
    expandedChainIds: number[];
}

/**
 * Component to define chain row columns
 */
export function ChainRow({ expandedChainIds }: ChainRowProps) {
    // Define columns for the chains
    const columns = [
        {
            accessor: "name",
            title: "Chain",
            render: ({ id, name }: AnimeCollectionChain) => (
                <div className={classes.titleCell}>
                    <ChevronRight
                        className={clsx(classes.icon, classes.expandIcon, {
                            [classes.expandIconRotated]:
                                expandedChainIds.includes(id),
                        })}
                    />
                    <Text className={classes.chainName}>{name}</Text>
                </div>
            ),
        },
    ];

    return { columns };
}
