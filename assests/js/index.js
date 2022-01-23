const sections = document.getElementById("sections");

const sectionTemplate = (section) => {
    const icon = section.icon ? '<i class="' + section.icon + '"></i>' : "";
    const timeLine = renderTimeLine(section.timeline || []);
    const skills = renderSkills(section.skills || []);
    return (`
        <div class="col-lg-6 col-md-12 mb-2">
            <div class="shadow-sm p-0 bg-white rounded grow" style="${section.height ? 'height:' + section.height + '' : ""}">
                <div class="shadow-none p-3 mb-5 bg-light rounded">
                    ${icon} ${section.title}
                </div>
                    <div class="px-4 content" style="${section.content_div_styles ? section.content_div_styles.join(";") : null}" >
                    ${section.content}
                        ${timeLine}
                        ${skills}
                    </div>
                </div>
        </div>`
    );
}
const renderTimeLine = (timeLineDetails) => {
    return (
        `<ul class="timeline">${timeLineDetails.map((timeLineItem) => (
            `<li>
                    <p target="_blank" href="">${timeLineItem.header}</p>
                    <p class="ml-1 text-muted" style='font-weight: 200;font-size: 14px;'>${timeLineItem.content}</p>
                </li>`
        )).join("")
        }
        </ul>`
    )

}

const renderSkills = (skills) => {
    return (
        `<div class="d-flex flex-wrap">
        ${skills.map((skill) => {
            return (
                `<div class="mx-3 my-2">
                    <div><i class="${skill.icon}" style="font-size:18px;"></i><span style="margin-left:2px;"">${skill.skill_name}</span></div>
                    <div class="text-muted" style='font-weight: 200;font-size: 14px;'>${skill.level}</div>
                </div>`
            );
        }).join("")}
        </div>`
    );
}
const renderSections = () => {
    const sectionDetailsList = DATA.section_details;
    const sectionDetails = [];
    for (const row of sectionDetailsList) {
        const sectionsInARow = [];
        for (const section of row) {
            sectionsInARow.push(sectionTemplate(section));
        }
        sectionDetails.push(`
            <div class="row mt-3">
                ${sectionsInARow.join("")}
            </div>`
        );
    }
    return sectionDetails.join("");
}

sections.innerHTML = renderSections();

