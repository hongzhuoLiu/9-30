import FieldsSelection from "../../components/ProgramsAndSubjectsLoad/FieldsSelection";
import GraduationLevelSelection from "../../components/ProgramsAndSubjectsLoad/GraduationLevelSelection";
import UniversitiesSelection from "../../components/ProgramsAndSubjectsLoad/UniversitiesSelection";
import ShowResults from "../../components/ProgramsAndSubjectsLoad/ShowResults";
import Book from "../../images/icons/writeCol.png";
import PageHeading from "../../components/Elements/PageHeading";
import {useDispatch} from "react-redux";
import {setDefaultSelected} from "../../app/features/filteringSubjectsAndPrograms/filteringSubjectsAndProgramsReducer";

function Subjects() {
    const dispatch = useDispatch();
    dispatch(setDefaultSelected());

    return (
        <>
            <PageHeading pageName="Subjects" icon={Book}/>

            <FieldsSelection pageType={"subject"}/>

            <GraduationLevelSelection/>

            <UniversitiesSelection/>

            <ShowResults pageType={"subject"}/>
        </>
    )
}

export default Subjects;