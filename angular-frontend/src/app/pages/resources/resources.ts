import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './resources.html',
  styleUrls: ['./resources.css', '../home/home.css']
})
export class ResourcesComponent implements OnInit {
  isVisible = false; // scroll-to-top

  // Preview modal state
  previewOpen = false;
  previewTitle = '';
  previewType: 'pdf' | 'audio' | null = null;
  previewUrl: SafeResourceUrl | null = null; // for iframe (PDF)
  audioUrl: string | null = null;           // for <audio> (MP3)

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.onScroll(); // initialize if user lands mid-page
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isVisible = window.scrollY > 300;
  }

  // ✅ Fix: don't pass $event; just close on ESC
  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.previewOpen) this.closePreview();
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Helpers
  private isLocalUrl(url: string): boolean {
    return (
      url.startsWith('/') ||
      url.startsWith('./') ||
      url.startsWith('assets') ||
      url.includes('localhost:4200')
    );
  }

  private gdocViewer(url: string): SafeResourceUrl {
    const viewer = 'https://drive.google.com/viewerng/viewer?embedded=1&url=';
    return this.sanitizer.bypassSecurityTrustResourceUrl(viewer + encodeURIComponent(url));
    // NOTE: used only for public internet PDFs; local PDFs embed directly
  }

  openPdfPreview(title: string, fileUrl: string): void {
    this.previewTitle = title;
    this.previewType = 'pdf';
    const normalized =
      fileUrl.startsWith('http') || fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;

    this.previewUrl = this.isLocalUrl(normalized)
      ? this.sanitizer.bypassSecurityTrustResourceUrl(normalized)
      : this.gdocViewer(normalized);

    this.audioUrl = null;
    this.previewOpen = true;
  }

  openAudioPreview(title: string, fileUrl: string): void {
    this.previewTitle = title;
    this.previewType = 'audio';
    this.audioUrl = fileUrl;
    this.previewUrl = null;
    this.previewOpen = true;
  }

  closePreview(): void {
    this.previewOpen = false;
    this.previewTitle = '';
    this.previewType = null;
    this.previewUrl = null;
    this.audioUrl = null;
  }
}
