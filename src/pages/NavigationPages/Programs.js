import FieldsSelection from "../../components/ProgramsAndSubjectsLoad/FieldsSelection";
import GraduationLevelSelection from "../../components/ProgramsAndSubjectsLoad/GraduationLevelSelection";
import UniversitiesSelection from "../../components/ProgramsAndSubjectsLoad/UniversitiesSelection";
import ShowResults from "../../components/ProgramsAndSubjectsLoad/ShowResults";
import Atom from "../../images/icons/atomicCol.png";
import PageHeading from "../../components/Elements/PageHeading";
import {setDefaultSelected} from "../../app/features/filteringSubjectsAndPrograms/filteringSubjectsAndProgramsReducer";
import {useDispatch} from "react-redux";
import PlaceSearchBox from "../../components/PlaceSearchBox/PlaceSearchBox";

function Programs() {
    const dispatch = useDispatch();
    dispatch(setDefaultSelected());

    return (
        <>
            <PageHeading pageName={"Programs"} icon={Atom}/>

            <FieldsSelection pageType={"program"}/>

            <GraduationLevelSelection/>

            <UniversitiesSelection/>
            
            <PlaceSearchBox />

            <ShowResults pageType={"program"}/>
        </>
    )
}

export default Programs;