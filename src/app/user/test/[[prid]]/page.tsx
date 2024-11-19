"use client";

import { useParams } from "next/navigation";

function Page() {
    type Id = {
        prid: string;
    }
    const { prid = 9 } = useParams() as Id
    return <p>Showing as {prid}</p>
}

export default Page;