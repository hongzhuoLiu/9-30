import PageHeading from "../../components/Elements/PageHeading";

// Import Memojis
import Xinwei from "../../images/memoji/Xinwei.png";
import Owen from "../../images/memoji/Owen.png";
import Si from "../../images/memoji/Si.png";
import Xingyu from "../../images/memoji/Xingyu.png";
import Lexie from "../../images/memoji/Lexie.png";
import Jack from "../../images/memoji/Jack.png";
import Sithum from "../../images/memoji/Sith.png";
import Will from "../../images/memoji/Will.png";
import Izak from "../../images/memoji/Izak.png";
import June from "../../images/memoji/June.png";
import WangLin from "../../images/memoji/Max.png";
import Louis from "../../images/memoji/Louis.png";
import Tashia from "../../images/memoji/Tashia.png";
import Devyani from "../../images/memoji/Devyani.png";
import About from "../../images/icons/about.png";

function AboutUs() {

    const aboutUsText = "Students Choice is an online platform designed to connect and inform upcoming and existing university students on the lifestyle, opportunities, culture and so much more of universities in order to help you find the perfect place to study."

    /**
     * List of developers with their icon IDs, names, gradient colors, and descriptions.
     *
     * Each item in the array contains the following properties:
     *
     * - `iconID`: The ID of the icon to display for the developer (from Strapi).
     * - `name`: The name of the developer.
     * - `gradient`: The CSS gradient style to apply to the name.
     * - `desc`: The description of the developer (e.g. their role).
     *
     * @type {Array<{iconID: number, name: string, gradient: string, desc: string}>}
     */
    const developers = [{
        img: Jack,
        name: "Jack",
        gradient: "bg-gradient-to-r from-blue-600 to-emerald-400",
        desc: "Front End Software Engineer"
    }, {
        img: Sithum,
        name: "Sithum",
        gradient: "bg-gradient-to-r from-purple-600 to-green-400",
        desc: "Full Stack Developer"
    }, {
        img: Will,
        name: "Will",
        gradient: "bg-gradient-to-r from-blue-600 to-indigo-400",
        desc: "Back End Software Engineer & Software Tester"
    }, {
        img: Izak,
        name: "Izak",
        gradient: "bg-gradient-to-r from-purple-600 to-rose-300",
        desc: "Front End Software Engineer"
    }, {
        img: June,
        name: "June",
        gradient: "bg-gradient-to-r from-fuchsia-600 to-rose-400",
        desc: "Full Stack Software Engineer"
    }, {
        img: WangLin,
        name: "WangLin",
        gradient: "bg-gradient-to-r from-cyan-700 to-orange-300",
        desc: "Back End Software Engineer"
    }, {
        img: Louis,
        name: "Louis",
        gradient: "bg-gradient-to-r from-sky-600 to-rose-300",
        desc: "Full Stack Software Engineer"
    }, {
        img: Tashia,
        name: "Tashia",
        gradient: "bg-gradient-to-r from-pink-700 to-green-300",
        desc: "Project Manager, Front End Software Engineer & Software Tester"
    }, {
        img: Xinwei,
        name: "Xinwei (Vivian) Li",
        gradient: "bg-gradient-to-r from-blue-600 to-emerald-400",
        desc: "Back End Software Engineer"
    }, {
        img: Owen,
        name: "Yuhua (Owen) Hong",
        gradient: "bg-gradient-to-r from-purple-600 to-green-400",
        desc: "Back End Software Engineer"
    }, {
        img: Si,
        name: "Si Chen",
        gradient: "bg-gradient-to-r from-blue-600 to-indigo-400",
        desc: "Front End Software Engineer"
    }, {
        img: Lexie,
        name: "Yuhan (Lexie) Xie",
        gradient: "bg-gradient-to-r from-purple-600 to-rose-300",
        desc: "Front End Software Engineer"
    }, {
        img: Xingyu,
        name: "Xingyu Du",
        gradient: "bg-gradient-to-r from-fuchsia-600 to-rose-400",
        desc: "Front End Software Engineer"
    }, {
        img: Devyani,
        name: "Devyani",
        gradient: "bg-gradient-to-r from-red-600 to-lime-400",
        desc: "Project manager"
    }];

    return (
        <>
            <PageHeading pageName="About Us" icon={About} altName="About us logo"/>

            <p className="mx-auto mt-12 text-center text-2xl text-gray-700 w-[75%] dark:text-white text-justify">{aboutUsText} </p>


            <p className="mx-auto mt-12 text-center text-2xl text-gray-700 w-[75%] dark:text-white text-justify">We know the stress
                and
                time consuming
                experience that is
                finding and comparing universities to another to pick the best one for you. Not to worry, we're here to
                help! At Students Choice, it's easy to compare universities with one another to find their key
                differences
                and understand what's the culture and education like at each one. We also make it easy to find the right
                place to start looking, head over to our <u><a
                    href="universities" style={{fontWeight: 'bold'}}>Universities</a></u>, <u><a
                    href="programs" style={{fontWeight: 'bold'}}>Programs</a></u> or <u><a
                    href="subjects" style={{fontWeight: 'bold'}}>Subjects</a></u> pages and go from there to find the
                perfect
                fit for you.</p>

            <p className="mx-auto mt-12 text-center text-2xl text-gray-700 w-[75%] dark:text-white text-justify">Chat with existing
                students to find out
                more, ask
                questions,
                and look at what people of the university are posting to see how university life looks. You can even
                follow
                a university, subject, and program to stay informed and up-to-date with the current events. This is a
                platform designed to be lead by and tailored for university students, who better to ask for a hand than
                someone who's also studying your dream degree.</p>

            <p className="mx-auto mt-12 text-center text-2xl text-gray-700 w-[75%] dark:text-white text-justify">Students Choice is
                developed by a
                passionate team of
                developers at the <u><a
                    href="universities/2" style={{fontWeight: 'bold'}}>Australian National University
                    (ANU)</a></u> as part of the <u><a
                    href="https://comp.anu.edu.au/TechLauncher/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{fontWeight: 'bold'}}
                >TechLauncher</a></u> program, hosted by Devyani Goodwin.
                Under her direction, our developers have been working on the platform for numerous semesters and is the
                proud product of the following hard working developers:</p>

            <div className="mx-auto mt-24 mb-12 grid scale-125 items-center justify-center self-center xs:grid-cols-1">
                <PersonalTable {...developers.find(developer => developer.name === 'Devyani')}/>
            </div>

            <div
                className="mx-auto mb-16 grid gap-x-6 gap-y-8 self-center xs:grid-cols-1 sm:w-[60%] md:grid-cols-2 lg:w-[45%] justify-start items-start sm:justify-center sm:items-center">
                {developers.filter(developer => developer.name !== 'Devyani').map(developer => <div
                    className="w-full" key={developer.name}>
                    <PersonalTable {...developer}/>
                </div>)}
            </div>
        </>
    )
}

export default AboutUs;

function PersonalTable({img, name, gradient, desc}) {
    return (
        <div className="flex items-center justify-start sm:justify-start">
            <img className="w-32" src={img} alt={img}/>
            <div>
                <p className={`text-2xl font-bold ${gradient} inline-block text-transparent bg-clip-text`}>{name}</p>
                <p className="text-gray-500 dark:text-gray-200">{desc}</p>
            </div>

        </div>
    );
}