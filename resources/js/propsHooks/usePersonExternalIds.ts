/*
{
  "freebase_mid": "/m/0b75jtr",
  "freebase_id": null,
  "imdb_id": "nm2794962",
  "tvrage_id": null,
  "wikidata_id": "Q231726",
  "facebook_id": "haileesteinfeld",
  "instagram_id": "haileesteinfeld",
  "tiktok_id": "haileesteinfeld",
  "twitter_id": "HaileeSteinfeld",
  "youtube_id": "haileesteinfeld"
}
  */

type ExternalIds = {
	freebase_mid: string | null;
	freebase_id: string | null;
	imdb_id: string | null;
	tvrage_id: string | null;
	wikidata_id: string | null;
	facebook_id: string | null;
	instagram_id: string | null;
	tiktok_id: string | null;
	twitter_id: string | null;
	youtube_id: string | null;
};

import { useTypedPageProps } from './useTypedPageProps';

export function usePersonExternalIds() {
	const props = useTypedPageProps();
	const externalIds = props.external_ids as unknown as ExternalIds;
	return externalIds;
}
