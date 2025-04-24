import { useTypedPageProps } from './useTypedPageProps';

type PersonDetails = {
	id: number;
	name: string;
	profile_path: string | null;
	biography: string | null;
	birthday: string | null;
	place_of_birth: string | null;
	gender: number | null;
	known_for_department: string | null;
	homepage?: string | null;
	also_known_as?: string[] | null;
};

export function usePersonDetails() {
	const props = useTypedPageProps();
	const personDetails = props.person as unknown as PersonDetails;
	return personDetails;
}
