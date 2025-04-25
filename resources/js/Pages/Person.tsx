import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout/AuthenticatedLayout';
import { usePersonCredits } from '@/propsHooks/usePersonCredits';
import { usePersonDetails } from '@/propsHooks/usePersonDetails';
import { usePersonExternalIds } from '@/propsHooks/usePersonExternalIds';
import { PersonProvider } from '@/Components/Person/store/personStore';
import { PersonContent } from '@/Components/Person/PersonContent';

function Person() {
	const personDetails = usePersonDetails();
	const { movie_cast, movie_crew, tv_cast, tv_crew, anime_cast, anime_crew } =
		usePersonCredits();
	const external_ids = usePersonExternalIds();

	const initialStoreProps = {
		person: personDetails,
		movie_cast,
		movie_crew,
		tv_cast,
		tv_crew,
		anime_cast,
		anime_crew,
		external_ids,
	};

	return (
		<PersonProvider {...initialStoreProps}>
			<PersonContent />
		</PersonProvider>
	);
}

Person.layout = (page: React.ReactNode) => (
	<AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default Person;
