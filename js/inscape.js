

function validE(e) {
    const patt = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return patt.test(e);
  }
  
//   const e = "example@domain.com";
//   if (validE(e)) {
//     console.log("Valid email address");
//   } else {
//     console.log("Invalid email address");
//   }

// Page script: Contact form (Contactus.html)
document.addEventListener('DOMContentLoaded', function() {
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    // Helpers
    function toTitleCase(str) {
      return String(str)
        .toLowerCase()
        .replace(/\b([a-z])(\w*)/g, function(_, first, rest){ return first.toUpperCase() + rest; });
    }
    function sanitizePhone(input) {
      var value = input.value.replace(/[^0-9]/g, '');
      if (value.length > 10) { value = value.slice(0,10); }
      input.value = value;
    }
    function updateSubmitState() {
      var btn = document.getElementById('submitBtn');
      if (btn) { btn.disabled = !contactForm.checkValidity(); }
    }

    // Field refs
    var fname = document.getElementById('fname');
    var lname = document.getElementById('lname');
    var mobile = document.getElementById('mobileno');
    var email = document.getElementById('email');
    var subject = document.getElementById('subject');
    var optin = document.getElementById('optin');

    // Name auto-capitalize on blur
    if (fname) { fname.addEventListener('blur', function(){ this.value = toTitleCase(this.value); }); }
    if (lname) { lname.addEventListener('blur', function(){ this.value = toTitleCase(this.value); }); }

    // Phone sanitize on input
    if (mobile) {
      mobile.addEventListener('input', function(){
        sanitizePhone(this);
        if (this.value.length !== 10) {
          this.setCustomValidity('Enter exactly 10 digits');
        } else {
          this.setCustomValidity('');
        }
        updateSubmitState();
      });
      mobile.addEventListener('blur', function(){
        sanitizePhone(this);
        if (this.value.length !== 10) { this.reportValidity(); }
      });
    }

    // Email live validation
    if (email) {
      email.addEventListener('input', function(){
        if (!validE(this.value)) {
          this.setCustomValidity('Please enter a valid email address');
        } else {
          this.setCustomValidity('');
        }
        updateSubmitState();
      });
      email.addEventListener('blur', function(){
        if (!validE(this.value)) { this.reportValidity(); }
      });
    }

    // Message char counter and dynamic placeholder
    if (subject) {
      var counter = document.createElement('div');
      counter.style.fontSize = '12px';
      counter.style.color = '#0164A5';
      counter.style.textAlign = 'right';
      counter.setAttribute('aria-live', 'polite');
      subject.parentNode.appendChild(counter);
      var updateCount = function(){ counter.textContent = (subject.value.length || 0) + ' characters'; };
      subject.addEventListener('input', function(){ updateCount(); updateSubmitState(); });
      updateCount();
    }

    // Change message placeholder based on interest
    if (optin && subject) {
      var placeholders = {
        newconstruction: 'Share site address, size, and timeline... ',
        renovations: 'Share current condition and desired changes... ',
        plans: 'Share plan type needed and dimensions... ',
        approvals: 'Share permit/approval type and location... '
      };
      optin.addEventListener('change', function(){
        var ph = placeholders[this.value] || 'Please describe your project requirements...';
        subject.placeholder = ph;
      });
    }

    // Initial submit state
    updateSubmitState();

    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      var submitBtn = document.getElementById('submitBtn');
      var formStatus = document.getElementById('formStatus');

      if (!submitBtn || !formStatus) return;

      submitBtn.disabled = true;
      submitBtn.value = 'Sending...';
      formStatus.style.display = 'block';
      formStatus.innerHTML = '<p style="color: #0164A5; background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 6px;">⏳ Sending your message...</p>';

      var formData = new FormData(contactForm);

      fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
      .then(function(response) { return response.ok ? null : response.json().catch(function(){ return null; }); })
      .then(function(err) {
        if (!err) {
          formStatus.innerHTML = '<p style="color: #155724; background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 6px;">✅ Your message has been sent successfully! We will contact you within 48 hours.</p>';
          contactForm.reset();
        } else {
          var msg = (err && err.errors && err.errors.length) ? err.errors.map(function(e){ return e.message; }).join(' ') : 'Submission failed';
          formStatus.innerHTML = '<p style="color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 6px;">❌ There was an error sending your message: ' + msg + '. Please try again or contact us directly.</p>';
        }
      })
      .catch(function() {
        formStatus.innerHTML = '<p style="color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 6px;">❌ Network error. Please try again.</p>';
      })
      .finally(function() {
        submitBtn.disabled = false;
        submitBtn.value = 'Send';
      });
    });
  }

  // Page script: Samples email capture form (Samples.html)
  var samplesForm = document.getElementById('samplesEmailForm');
  if (samplesForm) {
    var status = document.getElementById('emailStatus');
    // Simple validation and submit button enablement
    var samplesEmail = document.getElementById('samplesEmail');
    function updateSamplesSubmitState(){
      var btn = samplesForm.querySelector('input[type="submit"]');
      if (!btn) return;
      if (!samplesEmail) { btn.disabled = false; return; }
      var v = (samplesEmail.value || '').trim();
      btn.disabled = (v !== '' && !validE(v));
    }
    if (samplesEmail) {
      samplesEmail.addEventListener('input', function(){
        var v = (this.value || '').trim();
        if (v !== '' && !validE(v)) { this.setCustomValidity('Please enter a valid email address'); }
        else { this.setCustomValidity(''); }
        updateSamplesSubmitState();
      });
      samplesEmail.addEventListener('blur', function(){
        var v = (this.value || '').trim();
        if (v !== '' && !validE(v)) { this.reportValidity(); }
      });
      updateSamplesSubmitState();
    }
    samplesForm.addEventListener('submit', function(e){
      e.preventDefault();
      // If email is empty, don't submit; just show a gentle notice
      var v = samplesEmail ? (samplesEmail.value || '').trim() : '';
      if (v === '') {
        if (status) {
          status.style.display = 'block';
          status.innerHTML = '<p style="color:#856404; background:#fff3cd; border:1px solid #ffeeba; padding:10px; border-radius:6px;">ℹ️ Email not provided. Skipping submission.</p>';
        }
        return;
      }
      var submitBtn = samplesForm.querySelector('input[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.value = 'Sending...'; }
      if (status) {
        status.style.display = 'block';
        status.innerHTML = '<p style="color:#0164A5; background:#d1ecf1; border:1px solid #bee5eb; padding:10px; border-radius:6px;">⏳ Sending...</p>';
      }
      var data = new FormData(samplesForm);
      fetch(samplesForm.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
        .then(function(response){
          if (response.ok) return null;
          return response.json().catch(function(){ return null; });
        })
        .then(function(err){
          if (status) {
            if (!err) {
              status.innerHTML = '<p style="color:#155724; background:#d4edda; border:1px solid #c3e6cb; padding:10px; border-radius:6px;">✅ Thanks! We\'ll email you more samples soon.</p>';
              samplesForm.reset();
            } else {
              var msg = (err && err.errors && err.errors.length) ? err.errors.map(function(e){return e.message;}).join(' ') : 'Submission failed';
              status.innerHTML = '<p style="color:#721c24; background:#f8d7da; border:1px solid #f5c6cb; padding:10px; border-radius:6px;">❌ ' + msg + '</p>';
            }
          }
        })
        .catch(function(){
          if (status) {
            status.innerHTML = '<p style="color:#721c24; background:#f8d7da; border:1px solid #f5c6cb; padding:10px; border-radius:6px;">❌ Network error. Please try again.</p>';
          }
        })
        .finally(function(){
          if (submitBtn) { submitBtn.disabled = false; submitBtn.value = 'Send'; }
        });
    });
  }

  // Page script: Careers form (Careers.html)
  var careersForm = document.getElementById('careersForm');
  if (careersForm) {
    function toTitleCase(str) {
      return String(str)
        .toLowerCase()
        .replace(/\b([a-z])(\w*)/g, function(_, first, rest){ return first.toUpperCase() + rest; });
    }
    function sanitizePhone10(input) {
      var value = input.value.replace(/[^0-9]/g, '');
      if (value.length > 10) { value = value.slice(0,10); }
      input.value = value;
      if (value.length !== 10) { input.setCustomValidity('Enter exactly 10 digits'); }
      else { input.setCustomValidity(''); }
    }
    var cfF = careersForm.querySelector('#fname');
    var cfL = careersForm.querySelector('#lname');
    var cfM = careersForm.querySelector('#mobileno');
    var cfE = careersForm.querySelector('#email');
    var cfExp = careersForm.querySelector('#experience');
    if (cfF) { cfF.addEventListener('blur', function(){ this.value = toTitleCase(this.value); }); }
    if (cfL) { cfL.addEventListener('blur', function(){ this.value = toTitleCase(this.value); }); }
    if (cfM) { cfM.addEventListener('input', function(){ sanitizePhone10(this); }); cfM.addEventListener('blur', function(){ sanitizePhone10(this); if (this.value.length !== 10) this.reportValidity(); }); }
    if (cfE) { cfE.addEventListener('input', function(){ if (!validE(this.value)) this.setCustomValidity('Please enter a valid email'); else this.setCustomValidity(''); }); }
    if (cfExp) { cfExp.addEventListener('input', function(){ if (this.value !== '' && (this.value < 0 || this.value > 50)) { this.setCustomValidity('Experience must be between 0 and 50'); } else { this.setCustomValidity(''); } }); }

    careersForm.addEventListener('submit', function(e){
      e.preventDefault();
      var submitBtn = document.getElementById('submitBtn');
      var formStatus = document.getElementById('formStatus');
      if (!submitBtn || !formStatus) return;
      submitBtn.disabled = true;
      submitBtn.value = 'Submitting...';
      formStatus.style.display = 'block';
      formStatus.innerHTML = '<p style="color: #0164A5; background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 6px;">⏳ Submitting your application...</p>';
      var formData = new FormData(careersForm);
      fetch(careersForm.action, { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } })
        .then(function(response){ return response.ok ? null : response.json().catch(function(){ return null; }); })
        .then(function(err){
          if (!err) {
            formStatus.innerHTML = '<p style="color: #155724; background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 6px;">✅ Your application has been submitted successfully! We will contact you soon.</p>';
            careersForm.reset();
          } else {
            var msg = (err && err.errors && err.errors.length) ? err.errors.map(function(e){return e.message;}).join(' ') : 'Submission failed';
            formStatus.innerHTML = '<p style="color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 6px;">❌ ' + msg + '</p>';
          }
        })
        .catch(function(){
          formStatus.innerHTML = '<p style="color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 6px;">❌ Network error. Please try again.</p>';
        })
        .finally(function(){
          submitBtn.disabled = false;
          submitBtn.value = 'Send';
        });
    });
  }
});