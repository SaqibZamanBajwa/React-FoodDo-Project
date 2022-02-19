import React, { useState, useEffect } from "react";
import logo from "../images/logo.png";
import NavLink from "./NavLink";
import { LibraryIcon } from "@heroicons/react/solid";
import { openDB } from "idb";
import { Link as link } from "react-router-dom";

const LeftPanel = ({
  isCatogories,
  finalState,
  selectedBrand_Menu,
  setIsItemAvilableOpen,
  isItemAvilableOpen,
  hiddenCategories,
  categoryDraggable,
}) => {
  const [state, setState] = useState(
    JSON.parse(sessionStorage.getItem("finalState"))
  );

  const [outlet, setOutlet] = useState([]);

  useEffect(() => {
    const getDataFromIndexdDb = async () => {
      const db = await openDB("FoodDo", 1);
      const indSections = await db
        .transaction("outlet", "readonly")
        .objectStore("outlet");
      const currentSections = (await indSections.getAll())[0];
      setOutlet(currentSections.section_details);
    };
    getDataFromIndexdDb();
  }, []);

  console.log(outlet);

  return (
    <div className="left-panel">
      <img src={logo} alt="" />
      <div className="nav">
        {!isCatogories ? (
          <>
            <NavLink
              title={"Master"}
              icon={<LibraryIcon style={{ height: "36px" }} />}
              href="/page3"
              link="/page3"
              isActive={true}
              menuList={[
                {
                  name: "SS User",
                  link: "/Page3",
                },
                {
                  name: "Organization",
                  link: "/item",
                },
                {
                  name: "Brand",
                  link: "/item",
                },
                {
                  name: "Outlet",
                  link: "/item",
                },
                {
                  name: "SubScriptions",
                  link: "/item",
                },
                {
                  name: "Payments",
                  link: "/item",
                },
              ]}
            />
            <NavLink
              title={"Settings"}
              icon={<LibraryIcon style={{ height: "36px" }} />}
              isActive={false}
              menuList={[
                {
                  name: "Item & Category Setting",
                  link: "/item",
                },
                {
                  name: "Payment Mode Setting",
                  link: "/item",
                },
                {
                  name: "Outlet & User Setting",
                  link: "/item",
                },
              ]}
            />
          </>
        ) : (
          <div>
            {outlet
              .sort((a, b) =>
                a.section_sort_order > b.section_sort_order ? 0 : -1
              )
              .map((item, i) => (
                <NavLink
                  key={i}
                  draggable={categoryDraggable}
                  title={item.section_name}
                  isActive={true}
                />
              ))}

            {state && selectedBrand_Menu
              ? state.menues
                  .find((menu) => menu.menu_uuid === selectedBrand_Menu)
                  .category_and_items.map((category) => {
                    const hiddenCg = JSON.parse(
                      sessionStorage.getItem("hiddenCategories")
                    );
                    const isHidden =
                      hiddenCg &&
                      hiddenCg.find((i) => i === category.category_uuid);

                    if (isHidden) return;
                    else
                      return (
                        <NavLink
                          key={Math.random()}
                          title={category.category_name}
                          isActive={false}
                        />
                      );
                  })
              : ""}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftPanel;
