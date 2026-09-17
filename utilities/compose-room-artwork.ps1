param([string]$Original, [string]$Candidate, [string]$Output, [int]$X, [int]$Y, [int]$Width, [int]$Height)
# Authorized localized compositing: candidate coordinates are copied without scaling.
# Feather only inside the declared edit rectangle; all exterior pixels are original.
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
public static class RoomArtworkPatch {
    public static string Compose(string source, string candidate, string output, int x, int y, int w, int h) {
        using (var original = new Bitmap(source))
        using (var edited = new Bitmap(candidate))
        using (var result = new Bitmap(original)) {
            if (x < 0 || y < 0 || x+w > original.Width || y+h > original.Height || x+w > edited.Width || y+h > edited.Height) throw new Exception("Invalid patch bounds");
            for (int py=y; py<y+h; py++) for (int px=x; px<x+w; px++) {
                var a=original.GetPixel(px,py); var b=edited.GetPixel(px,py);
                double blend=Math.Min(1.0, Math.Min(Math.Min(px-x,x+w-1-px),Math.Min(py-y,y+h-1-py))/12.0);
                result.SetPixel(px,py,Color.FromArgb(255,(int)(a.R+(b.R-a.R)*blend),(int)(a.G+(b.G-a.G)*blend),(int)(a.B+(b.B-a.B)*blend)));
            }
            result.Save(output,ImageFormat.Png);
            long exteriorChanges=0;
            using (var saved=new Bitmap(output)) {
                if(saved.Width!=original.Width || saved.Height!=original.Height) throw new Exception("Canvas changed");
                for(int py=0;py<original.Height;py++) for(int px=0;px<original.Width;px++) {
                    if(px>=x && px<x+w && py>=y && py<y+h) continue;
                    if(original.GetPixel(px,py).ToArgb()!=saved.GetPixel(px,py).ToArgb()) exteriorChanges++;
                }
            }
            if(exteriorChanges!=0) throw new Exception("Exterior pixels changed");
            return "Canvas "+original.Width+"x"+original.Height+"; patch "+x+","+y+","+w+","+h+"; changed exterior pixels: "+exteriorChanges;
        }
    }
}
'@
[RoomArtworkPatch]::Compose((Resolve-Path -LiteralPath $Original).Path, (Resolve-Path -LiteralPath $Candidate).Path, [System.IO.Path]::GetFullPath($Output), $X, $Y, $Width, $Height)
