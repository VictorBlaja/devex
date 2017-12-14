{{#markdown this}}
![GC Dev Exchange](https://beta.gcdevexchange.org/modules/core/client/img/logo/new-logo-220px.png)

### Hi {{data.username}}!

We've just posted a new *Code With Us* opportunity:

### {{ data.name }}

- Posted: **{{ data.datePublished }}**
- Value: **{{ data.earn }}**
- Required Skills: **{{ data.skills }}**
- Closes on: **{{ data.deadline_format_date }}**

### [See the details]({{ data.domain }}/en/opportunities/{{ data.code }})


[Follow this opportunity]({{ data.domain }}/api/subscribe/{{ data.subscriptionId }}/{{ data.updatenotification }}) to get alerts.

---

### Use your skills to make a difference!

Contribute to this government open source project in GitHub. Get paid a fixed fee that meets the acceptance criteria.

---

**Want to stop receiving these emails?**

[Unsubscribe now]({{ data.domain }}/api/unsubscribe/{{ data.subscriptionId }}) from notifications of new opportunities or manage notification preferences in your profile at [beta.gcdevexchange.org](https://beta.gcdevexchange.org).
{{/markdown}}
