import useCursor from "@/hooks/use-cursor";

export default function Header(){

    const { setIsCursorOnNav } = useCursor();

    return(
        <header
            className="header bg-wga-blue"
            onMouseEnter={() => setIsCursorOnNav(true)}
            onMouseLeave={() => setIsCursorOnNav(false)}
        />
    )
}