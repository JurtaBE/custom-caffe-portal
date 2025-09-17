'use client';
import Image from "next/image";
import { pacifico } from "@/app/layout";
import PrototypePortail from "@/components/PrototypePortail";

export default function CustomCaffePortal(){
  return (
    <div className="min-h-screen">
      <header className="flex flex-col items-center justify-center py-6 border-b border-[#d3bfa6] bg-[#f0e4d7]">
        <Image src="/custom-caffe-logo.png" alt="Custom Caffe" width={100} height={100} className="mb-2" />
        <h1 className={`${pacifico.className} text-4xl text-[#6f4e37]`}>Custom Caffe — Portail RH</h1>
      </header>
      <div className="mt-6">
        <PrototypePortail/>
      </div>
      <footer className={`${pacifico.className} text-center py-6 text-sm text-[#6f4e37] border-t border-[#d3bfa6]`}>
        © 2025 Custom Caffe • Portail interne RH • Fait avec ☕ et Next.js
      </footer>
    </div>
  );
}
