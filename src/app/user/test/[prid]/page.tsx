"use client";

import { useParams } from "next/navigation";

function TestParamPage() {
    type Id = {
        prid: string;
    }
    const { prid = 9 } = useParams() as Id
    return <p>Showing as {prid}</p>
}

export default TestParamPage;