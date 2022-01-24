const profileHeader = document.getElementById("profile-header");
const sections = document.getElementById("sections");
const htmlTitle = document.getElementsByName("title");

const renderProfileHeader = () => {
    const profileHeader = DATA.profile_header || {};
    const socialIcons = DATA.profile_header.social_connect || [];
    return (
        `<div class="row justify-content-center">
            <img src="${profileHeader.profile_picture}" class="rounded-circle avatar" alt="Avatar">
        </div>
        <div class="row justify-content-center">
            <div class="text-center mt-4">
                <div class="name" style="font-size: 1.5rem;">${profileHeader.name}</div>
                <div class="text-muted" style="font-weight: 200;">${profileHeader.current_job}</div>
                <div class="text-muted" style="font-weight: 200; font-size: 12px;">${profileHeader.phone_number}</div>
                <div class="social-connect">
                    ${socialIcons.map((social) => {
                        return (
                            `<a href="${social.link}" class="mx-1"><i class="${social.icon}"></i></a>`
                            )
                        }
                    ).join("")
                }
                </div>
            </div>
        </div>`
    )
}

const updateHtmlTitle = () => {
    const title = DATA.html_title;
    const htmlTitleElement = document.createElement("title");
    htmlTitleElement.innerHTML = title;
    const htmlHeadElement = document.getElementsByTagName("head");
    htmlHeadElement[0].appendChild(htmlTitleElement);
}

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
updateHtmlTitle();
profileHeader.innerHTML = renderProfileHeader();
sections.innerHTML = renderSections();

